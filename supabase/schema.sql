-- =====================================================
-- Spot It Game Database Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql

-- =====================================================
-- 1. Game Records Table
-- =====================================================
-- Stores individual game play records for each user
CREATE TABLE IF NOT EXISTS game_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level_id TEXT NOT NULL,
  level_slug TEXT NOT NULL,
  level_title TEXT NOT NULL,

  -- Game Statistics
  score INTEGER NOT NULL,
  time_elapsed INTEGER NOT NULL, -- seconds
  accuracy DECIMAL(5,2) NOT NULL, -- percentage
  total_clicks INTEGER NOT NULL,
  wrong_clicks INTEGER NOT NULL,
  hints_used INTEGER NOT NULL DEFAULT 0,
  max_combo INTEGER NOT NULL DEFAULT 0,
  stars DECIMAL(2,1) NOT NULL, -- 1.0 to 3.0

  -- Earned Badges (stored as JSON array of badge IDs)
  badges_earned JSONB DEFAULT '[]'::jsonb,

  -- Performance V1 scoring snapshot
  target_time INTEGER NOT NULL DEFAULT 200,
  found INTEGER NOT NULL DEFAULT 0,
  total_differences INTEGER NOT NULL DEFAULT 1,
  completion NUMERIC(4,3) NOT NULL DEFAULT 1,
  t_score SMALLINT NOT NULL DEFAULT 0,
  a_score SMALLINT NOT NULL DEFAULT 0,
  h_score SMALLINT NOT NULL DEFAULT 0,
  c_score SMALLINT NOT NULL DEFAULT 0,
  performance SMALLINT NOT NULL DEFAULT 0,
  rating TEXT NOT NULL DEFAULT 'C' CHECK (rating IN ('S+', 'S', 'A', 'B', 'C')),
  is_new_pb BOOLEAN NOT NULL DEFAULT false,
  is_first_attempt BOOLEAN NOT NULL DEFAULT false,
  score_contribution INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_records_user_id ON game_records(user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_level_slug ON game_records(level_slug);
CREATE INDEX IF NOT EXISTS idx_game_records_score ON game_records(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_records_played_at ON game_records(played_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_records_one_first_attempt
  ON game_records(user_id, level_slug)
  WHERE is_first_attempt = true;
CREATE INDEX IF NOT EXISTS idx_game_records_first_attempt_ranking
  ON game_records(level_slug, score DESC, time_elapsed ASC, accuracy DESC, played_at ASC, user_id ASC)
  WHERE is_first_attempt = true;

-- =====================================================
-- 2. User Profiles Table
-- =====================================================
-- Extended user information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,

  -- Game Statistics
  total_games_played INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  total_stars INTEGER DEFAULT 0,

  -- Badge Collection (unique badges earned)
  unique_badges JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- =====================================================
-- 3. Leaderboard View
-- =====================================================
-- Materialized view for global leaderboard
CREATE OR REPLACE VIEW global_leaderboard AS
SELECT
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.total_games_played,
  p.total_score,
  p.total_stars,
  COUNT(DISTINCT gr.id) as games_count,
  ROUND(AVG(gr.stars), 2) as avg_stars,
  MAX(gr.score) as best_score,
  ROW_NUMBER() OVER (ORDER BY p.total_score DESC) as rank
FROM profiles p
LEFT JOIN game_records gr ON p.id = gr.user_id
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.total_games_played, p.total_score, p.total_stars
ORDER BY p.total_score DESC;

-- =====================================================
-- 4. Per-Level Leaderboard View
-- =====================================================
CREATE OR REPLACE VIEW level_leaderboard AS
SELECT
  gr.level_slug,
  gr.level_title,
  p.id as user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  MAX(gr.score) as best_score,
  MIN(gr.time_elapsed) as fastest_time,
  MAX(gr.stars) as best_stars,
  MAX(gr.accuracy) as best_accuracy,
  ROW_NUMBER() OVER (PARTITION BY gr.level_slug ORDER BY MAX(gr.score) DESC) as rank
FROM game_records gr
JOIN profiles p ON gr.user_id = p.id
GROUP BY gr.level_slug, gr.level_title, p.id, p.username, p.display_name, p.avatar_url
ORDER BY gr.level_slug, best_score DESC;

-- First completed attempt per user. The scoring migration owns the trigger
-- that marks is_first_attempt and backfills historical rows.
CREATE OR REPLACE VIEW level_first_attempt_leaderboard
WITH (security_invoker = true) AS
SELECT
  gr.level_slug,
  gr.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  gr.score,
  gr.time_elapsed,
  gr.accuracy,
  gr.rating,
  COALESCE(gr.played_at, gr.created_at) AS first_attempt_at,
  ROW_NUMBER() OVER (
    PARTITION BY gr.level_slug
    ORDER BY
      gr.score DESC,
      gr.time_elapsed ASC,
      gr.accuracy DESC,
      COALESCE(gr.played_at, gr.created_at) ASC NULLS LAST,
      gr.user_id ASC
  ) AS rank
FROM game_records gr
LEFT JOIN profiles p ON p.id = gr.user_id
WHERE gr.is_first_attempt = true;

CREATE OR REPLACE VIEW level_first_attempt_stats
WITH (security_invoker = true) AS
SELECT
  gr.level_slug,
  COUNT(*)::INTEGER AS participant_count,
  ROUND(AVG(gr.score))::INTEGER AS average_first_score,
  ROUND(AVG(gr.time_elapsed))::INTEGER AS average_first_time
FROM game_records gr
WHERE gr.is_first_attempt = true
GROUP BY gr.level_slug;

GRANT SELECT ON level_first_attempt_leaderboard TO anon, authenticated;
GRANT SELECT ON level_first_attempt_stats TO anon, authenticated;

-- =====================================================
-- 5. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on tables
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Game Records Policies
-- Users can view all game records (for leaderboards)
CREATE POLICY "Game records are viewable by everyone"
  ON game_records FOR SELECT
  USING (true);

-- Users can insert their own game records
CREATE POLICY "Users can insert their own game records"
  ON game_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Game attempts are intentionally append-only. UPDATE/DELETE policies are not
-- granted because removing a PB and resubmitting it would duplicate points.

-- Profile Policies
-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- 6. Triggers for Auto-updating Profiles
-- =====================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile stats when game record is inserted. Replays are
-- counted as plays, but only a new per-level PB contributes to total_score.
CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    total_games_played = total_games_played + 1,
    total_score = total_score + NEW.score_contribution,
    total_stars = total_stars + NEW.stars,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update profile stats
CREATE OR REPLACE TRIGGER on_game_record_created
  AFTER INSERT ON game_records
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER set_updated_at_game_records
  BEFORE UPDATE ON game_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 7. Helper Functions
-- =====================================================

-- Function to get user's best scores per level
CREATE OR REPLACE FUNCTION get_user_best_scores(p_user_id UUID)
RETURNS TABLE (
  level_slug TEXT,
  level_title TEXT,
  best_score INTEGER,
  best_stars DECIMAL,
  fastest_time INTEGER,
  plays_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gr.level_slug,
    gr.level_title,
    MAX(gr.score)::INTEGER as best_score,
    MAX(gr.stars) as best_stars,
    MIN(gr.time_elapsed)::INTEGER as fastest_time,
    COUNT(*)::BIGINT as plays_count
  FROM game_records gr
  WHERE gr.user_id = p_user_id
  GROUP BY gr.level_slug, gr.level_title
  ORDER BY best_score DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Done! 🎉
-- =====================================================
-- Next steps:
-- 1. Copy this entire SQL and run it in Supabase SQL Editor
-- 2. Verify tables are created in Database > Tables
-- 3. Configure your .env.local with Supabase credentials
-- =====================================================
