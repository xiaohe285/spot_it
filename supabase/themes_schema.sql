-- =====================================================
-- Themes Schema for Spot the Difference Game
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- IMPORTANT: Run this AFTER the levels_schema.sql
-- https://supabase.com/dashboard/project/_/sql
-- =====================================================

-- =====================================================
-- 1. Themes Table
-- =====================================================
CREATE TABLE IF NOT EXISTS themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Information
  title TEXT NOT NULL,
  description TEXT,
  cover TEXT NOT NULL, -- Cover image URL
  
  -- SEO Fields
  seo_title TEXT,
  seo_description TEXT,
  
  -- Status
  published BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for themes
CREATE INDEX IF NOT EXISTS idx_themes_published ON themes(published);
CREATE INDEX IF NOT EXISTS idx_themes_created_at ON themes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_themes_title ON themes(title);

-- =====================================================
-- 2. Add theme_id to levels table
-- =====================================================
ALTER TABLE levels 
ADD COLUMN IF NOT EXISTS theme_id UUID REFERENCES themes(id) ON DELETE SET NULL;

-- Add index for theme_id in levels table
CREATE INDEX IF NOT EXISTS idx_levels_theme ON levels(theme_id);

-- =====================================================
-- 3. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

-- Themes Policies (Public Read Published, Admin Write)
CREATE POLICY "Published themes are viewable by everyone"
  ON themes FOR SELECT
  USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert themes"
  ON themes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update themes"
  ON themes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete themes"
  ON themes FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. Triggers for updated_at
-- =====================================================

-- Trigger for themes
CREATE OR REPLACE TRIGGER set_updated_at_themes
  BEFORE UPDATE ON themes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 5. Useful Views
-- =====================================================

-- View for themes with level count
CREATE OR REPLACE VIEW themes_with_stats AS
SELECT
  t.id,
  t.title,
  t.description,
  t.cover,
  t.seo_title,
  t.seo_description,
  t.published,
  t.created_at,
  t.updated_at,
  COUNT(DISTINCT l.id) as level_count,
  COUNT(DISTINCT CASE WHEN l.difficulty = 'Easy' THEN l.id END) as easy_levels,
  COUNT(DISTINCT CASE WHEN l.difficulty = 'Hard' THEN l.id END) as hard_levels,
  COUNT(DISTINCT CASE WHEN l.difficulty = 'Expert' THEN l.id END) as expert_levels,
  COALESCE(SUM(l.total_plays), 0) as total_plays
FROM themes t
LEFT JOIN levels l ON t.id = l.theme_id AND l.published = true
GROUP BY t.id;

-- View for published themes with levels
CREATE OR REPLACE VIEW published_themes AS
SELECT *
FROM themes_with_stats
WHERE published = true AND level_count > 0
ORDER BY created_at DESC;

-- View for levels with theme info
CREATE OR REPLACE VIEW levels_with_theme AS
SELECT
  l.*,
  t.title as theme_title,
  t.description as theme_description,
  t.cover as theme_cover,
  t.seo_title as theme_seo_title,
  t.seo_description as theme_seo_description
FROM levels l
LEFT JOIN themes t ON l.theme_id = t.id;

-- Update the existing levels_with_category view to include theme info
DROP VIEW IF EXISTS levels_with_category CASCADE;
CREATE OR REPLACE VIEW levels_with_category AS
SELECT
  l.id,
  l.slug,
  l.title,
  l.description,
  l.image_url_1,
  l.image_url_2,
  l.differences,
  l.difficulty,
  l.display_order,
  l.seo_title,
  l.seo_description,
  l.total_plays,
  l.average_score,
  l.average_time,
  l.published,
  l.featured,
  l.created_at,
  l.updated_at,
  l.theme_id,
  c.id as category_id,
  c.slug as category_slug,
  c.name as category_name,
  c.icon as category_icon,
  t.title as theme_title,
  t.cover as theme_cover
FROM levels l
LEFT JOIN categories c ON l.category_id = c.id
LEFT JOIN themes t ON l.theme_id = t.id;

-- =====================================================
-- 6. Sample Data (Optional)
-- =====================================================
-- Uncomment and run these to add sample themes

/*
-- Sample themes
INSERT INTO themes (title, description, cover, seo_title, seo_description, published)
VALUES 
  (
    'Christmas Special',
    'Festive holiday-themed puzzles with Santa, reindeer, and winter wonderland scenes.',
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&h=600&fit=crop',
    'Christmas Spot the Difference Games | Holiday Puzzles',
    'Enjoy festive Christmas-themed spot the difference games. Find hidden differences in holiday scenes with Santa, reindeer, and winter wonderlands.',
    true
  ),
  (
    'Halloween Mysteries',
    'Spooky and fun Halloween puzzles featuring ghosts, pumpkins, and haunted houses.',
    'https://images.unsplash.com/photo-1509557965875-b88c97052f0e?w=1200&h=600&fit=crop',
    'Halloween Spot the Difference | Spooky Puzzle Games',
    'Discover spooky Halloween spot the difference puzzles. Find hidden differences in haunted scenes with ghosts, pumpkins, and mysterious creatures.',
    true
  ),
  (
    'Ocean Adventures',
    'Underwater themed puzzles with marine life, coral reefs, and ocean treasures.',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop',
    'Ocean Spot the Difference | Underwater Puzzle Adventures',
    'Dive into ocean-themed spot the difference games. Explore underwater scenes with marine life, coral reefs, and hidden treasures.',
    true
  ),
  (
    'Space Exploration',
    'Journey through space with astronauts, planets, and alien encounters.',
    'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=1200&h=600&fit=crop',
    'Space Spot the Difference | Astronaut Puzzle Games',
    'Blast off into space-themed spot the difference puzzles. Find differences in cosmic scenes with astronauts, planets, and alien worlds.',
    true
  );

-- Update some existing levels to assign them to themes (example)
-- UPDATE levels 
-- SET theme_id = (SELECT id FROM themes WHERE title = 'Christmas Special' LIMIT 1)
-- WHERE title LIKE '%Christmas%' OR title LIKE '%Holiday%' OR title LIKE '%Winter%';
*/

-- =====================================================
-- Done! 🎉
-- =====================================================
-- The themes table is now created with all necessary fields
-- and the levels table has been updated with theme_id
-- =====================================================