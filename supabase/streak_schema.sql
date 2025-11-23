-- =====================================================
-- Streak System for User Activity Tracking
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- IMPORTANT: Run this AFTER schema.sql and levels_schema.sql
-- https://supabase.com/dashboard/project/_/sql

-- =====================================================
-- 1. Function to get user's play dates
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_play_dates(p_user_id UUID)
RETURNS TABLE (play_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT DATE(played_at) as play_date
  FROM game_records
  WHERE user_id = p_user_id
  ORDER BY play_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. Function to calculate current streak
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_has_played BOOLEAN;
BEGIN
  -- Check each day backwards from today
  LOOP
    -- Check if user played on this date
    SELECT EXISTS(
      SELECT 1 FROM game_records
      WHERE user_id = p_user_id
      AND DATE(played_at) = v_check_date
    ) INTO v_has_played;

    -- If didn't play and it's not today, break the streak
    IF NOT v_has_played THEN
      -- Allow for today not being played yet
      IF v_check_date < CURRENT_DATE THEN
        EXIT;
      END IF;
    ELSE
      v_streak := v_streak + 1;
    END IF;

    -- Move to previous day
    v_check_date := v_check_date - 1;

    -- Safety limit: don't check more than 1000 days back
    IF v_streak > 1000 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN v_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. Function to calculate longest streak
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_longest_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_dates DATE[];
  v_current_streak INTEGER := 0;
  v_longest_streak INTEGER := 0;
  v_prev_date DATE;
  v_date DATE;
BEGIN
  -- Get all unique play dates
  SELECT ARRAY_AGG(play_date ORDER BY play_date)
  INTO v_dates
  FROM get_user_play_dates(p_user_id);

  IF v_dates IS NULL OR array_length(v_dates, 1) IS NULL THEN
    RETURN 0;
  END IF;

  -- Iterate through dates
  FOREACH v_date IN ARRAY v_dates
  LOOP
    IF v_prev_date IS NULL OR v_date = v_prev_date + 1 THEN
      -- Continue streak
      v_current_streak := v_current_streak + 1;
      v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    ELSE
      -- Streak broken, restart
      v_current_streak := 1;
    END IF;

    v_prev_date := v_date;
  END LOOP;

  RETURN v_longest_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Function to get last 30 days activity
-- =====================================================
CREATE OR REPLACE FUNCTION get_last_30_days_activity(p_user_id UUID)
RETURNS TABLE (
  activity_date DATE,
  played BOOLEAN
) AS $$
DECLARE
  v_date DATE;
BEGIN
  -- Generate last 30 days
  FOR i IN 0..29 LOOP
    v_date := CURRENT_DATE - i;

    activity_date := v_date;
    played := EXISTS(
      SELECT 1 FROM game_records
      WHERE user_id = p_user_id
      AND DATE(played_at) = v_date
    );

    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. Function to get complete streak stats
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_streak_stats(p_user_id UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  total_days INTEGER,
  last_play_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    calculate_current_streak(p_user_id) as current_streak,
    calculate_longest_streak(p_user_id) as longest_streak,
    COUNT(DISTINCT DATE(gr.played_at))::INTEGER as total_days,
    MAX(DATE(gr.played_at)) as last_play_date
  FROM game_records gr
  WHERE gr.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. View for user streak summary
-- =====================================================
CREATE OR REPLACE VIEW user_streak_summary AS
SELECT
  u.id as user_id,
  u.email,
  calculate_current_streak(u.id) as current_streak,
  calculate_longest_streak(u.id) as longest_streak,
  COUNT(DISTINCT DATE(gr.played_at))::INTEGER as total_days,
  MAX(DATE(gr.played_at)) as last_play_date
FROM auth.users u
LEFT JOIN game_records gr ON u.id = gr.user_id
GROUP BY u.id, u.email;

-- =====================================================
-- Done! 🎉
-- =====================================================
-- You can now query streak data using:
-- SELECT * FROM get_user_streak_stats('user-uuid');
-- SELECT * FROM get_last_30_days_activity('user-uuid');
-- =====================================================
