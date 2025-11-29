-- =====================================================
-- Daily Challenges Table Schema
-- =====================================================

-- Create daily_challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE, -- Ensures one challenge per date
  level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  bonus_multiplier DECIMAL(3,2) NOT NULL DEFAULT 2.0, -- e.g., 2.0 = double points
  special_badge TEXT, -- Name of special badge for this challenge
  special_title TEXT, -- Custom title for this challenge
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_active ON daily_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_level ON daily_challenges(level_id);

-- Create a unique constraint to ensure one active challenge per date
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_challenges_unique_active_date 
ON daily_challenges(challenge_date) 
WHERE is_active = true;

-- =====================================================
-- Daily Challenge Records Table
-- =====================================================

-- Track user participation in daily challenges
CREATE TABLE IF NOT EXISTS daily_challenge_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completion_time INTEGER, -- Time in seconds to complete
  score INTEGER NOT NULL DEFAULT 0,
  differences_found INTEGER NOT NULL DEFAULT 0,
  total_differences INTEGER NOT NULL,
  hints_used INTEGER NOT NULL DEFAULT 0,
  wrong_clicks INTEGER NOT NULL DEFAULT 0,
  bonus_earned INTEGER NOT NULL DEFAULT 0, -- Bonus points from multiplier
  badge_earned TEXT, -- Badge earned from this challenge
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for daily challenge records
CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_user ON daily_challenge_records(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_challenge ON daily_challenge_records(challenge_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_records_date ON daily_challenge_records(completed_at);

-- Unique constraint to prevent duplicate entries per user per challenge
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_challenge_records_unique_user_challenge 
ON daily_challenge_records(user_id, challenge_id);

-- =====================================================
-- Views for easier querying
-- =====================================================

-- View combining daily challenges with level information
CREATE OR REPLACE VIEW daily_challenges_with_level AS
SELECT 
  dc.*,
  l.slug as level_slug,
  l.title as level_title,
  l.description as level_description,
  l.image_url_1,
  l.image_url_2,
  l.differences,
  l.difficulty,
  l.category_id,
  c.name as category_name,
  c.slug as category_slug,
  c.icon as category_icon
FROM daily_challenges dc
JOIN levels l ON dc.level_id = l.id
LEFT JOIN categories c ON l.category_id = c.id
WHERE dc.is_active = true
ORDER BY dc.challenge_date DESC;

-- View for daily challenge leaderboards
CREATE OR REPLACE VIEW daily_challenge_leaderboard AS
SELECT 
  dcr.*,
  dc.challenge_date,
  dc.special_title,
  dc.special_badge,
  u.email as user_email,
  -- Calculate rank within each challenge
  ROW_NUMBER() OVER (
    PARTITION BY dcr.challenge_id 
    ORDER BY dcr.score DESC, dcr.completion_time ASC NULLS LAST, dcr.completed_at ASC
  ) as rank
FROM daily_challenge_records dcr
JOIN daily_challenges dc ON dcr.challenge_id = dc.id
JOIN auth.users u ON dcr.user_id = u.id
ORDER BY dc.challenge_date DESC, rank ASC;

-- =====================================================
-- Functions for daily challenge management
-- =====================================================

-- Function to get today's challenge (with fallback)
CREATE OR REPLACE FUNCTION get_todays_challenge()
RETURNS TABLE (
  challenge_id UUID,
  challenge_date DATE,
  level_id UUID,
  level_slug TEXT,
  level_title TEXT,
  level_description TEXT,
  image_url_1 TEXT,
  image_url_2 TEXT,
  differences JSONB,
  difficulty TEXT,
  bonus_multiplier DECIMAL,
  special_badge TEXT,
  special_title TEXT,
  category_name TEXT,
  category_slug TEXT,
  category_icon TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- First try to get today's scheduled challenge
  RETURN QUERY
  SELECT 
    dc.id as challenge_id,
    dc.challenge_date,
    dc.level_id,
    dc.level_slug,
    dc.level_title,
    dc.level_description,
    dc.image_url_1,
    dc.image_url_2,
    dc.differences,
    dc.difficulty,
    dc.bonus_multiplier,
    dc.special_badge,
    dc.special_title,
    dc.category_name,
    dc.category_slug,
    dc.category_icon
  FROM daily_challenges_with_level dc
  WHERE dc.challenge_date = CURRENT_DATE
  LIMIT 1;

  -- If no result found, the application will use the fallback algorithm
  RETURN;
END;
$$;

-- Function to create a new daily challenge
CREATE OR REPLACE FUNCTION create_daily_challenge(
  p_challenge_date DATE,
  p_level_id UUID,
  p_bonus_multiplier DECIMAL DEFAULT 2.0,
  p_special_badge TEXT DEFAULT 'Daily Champion',
  p_special_title TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_challenge_id UUID;
  v_level_title TEXT;
BEGIN
  -- Get level title for default special_title
  SELECT title INTO v_level_title FROM levels WHERE id = p_level_id;
  
  -- Insert new daily challenge
  INSERT INTO daily_challenges (
    challenge_date,
    level_id,
    bonus_multiplier,
    special_badge,
    special_title
  ) VALUES (
    p_challenge_date,
    p_level_id,
    p_bonus_multiplier,
    p_special_badge,
    COALESCE(p_special_title, v_level_title || ' Daily Challenge')
  )
  RETURNING id INTO v_challenge_id;

  RETURN v_challenge_id;
END;
$$;

-- =====================================================
-- Triggers
-- =====================================================

-- Update timestamp trigger for daily_challenges
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_challenges_updated_at
  BEFORE UPDATE ON daily_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- Sample Data (Optional)
-- =====================================================

-- Insert some sample daily challenges for the next week
-- Note: This would typically be managed by an admin interface
/*
DO $$
DECLARE
  v_level_ids UUID[];
  v_date DATE;
  i INTEGER;
BEGIN
  -- Get some random published level IDs
  SELECT ARRAY(
    SELECT id FROM levels 
    WHERE published = true 
    ORDER BY RANDOM() 
    LIMIT 10
  ) INTO v_level_ids;

  -- Create challenges for next 7 days
  FOR i IN 0..6 LOOP
    v_date := CURRENT_DATE + (i || ' days')::INTERVAL;
    
    -- Skip if challenge already exists for this date
    IF NOT EXISTS (SELECT 1 FROM daily_challenges WHERE challenge_date = v_date) THEN
      PERFORM create_daily_challenge(
        v_date,
        v_level_ids[1 + (i % array_length(v_level_ids, 1))],
        2.0,
        CASE 
          WHEN i = 0 THEN 'Today''s Champion'
          ELSE 'Daily Champion'
        END,
        NULL
      );
    END IF;
  END LOOP;
END;
$$;
*/