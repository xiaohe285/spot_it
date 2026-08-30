-- =====================================================
-- SpotDiffs XP growth system
-- =====================================================
-- Run after:
--   1. schema.sql
--   2. levels_schema.sql
--   3. scoring_v2_migration.sql
--   4. first_attempt_leaderboard_migration.sql
--
-- XP is calculated and accumulated by database triggers. Client-supplied XP,
-- achievement and first-clear fields are always overwritten.

BEGIN;

-- =====================================================
-- 1. XP configuration snapshots
-- =====================================================

ALTER TABLE public.levels
  ADD COLUMN IF NOT EXISTS difficulty_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS total_differences INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.default_difficulty_multiplier(p_difficulty TEXT)
RETURNS NUMERIC AS $$
  SELECT CASE p_difficulty
    WHEN 'Easy' THEN 1.00
    WHEN 'Medium' THEN 1.10
    WHEN 'Hard' THEN 1.20
    WHEN 'Expert' THEN 1.30
    ELSE 1.00
  END::NUMERIC(3,2);
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.set_level_xp_defaults()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_differences := GREATEST(jsonb_array_length(NEW.differences), 0);

  IF TG_OP = 'INSERT' OR NEW.difficulty IS DISTINCT FROM OLD.difficulty THEN
    NEW.difficulty_multiplier := public.default_difficulty_multiplier(NEW.difficulty);
  ELSIF NEW.difficulty_multiplier IS NULL OR NEW.difficulty_multiplier <= 0 THEN
    NEW.difficulty_multiplier := public.default_difficulty_multiplier(NEW.difficulty);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_level_xp_defaults ON public.levels;
CREATE TRIGGER set_level_xp_defaults
  BEFORE INSERT OR UPDATE ON public.levels
  FOR EACH ROW EXECUTE FUNCTION public.set_level_xp_defaults();

UPDATE public.levels
SET
  difficulty_multiplier = public.default_difficulty_multiplier(difficulty),
  total_differences = GREATEST(jsonb_array_length(differences), 0);

CREATE OR REPLACE VIEW public.levels_with_category AS
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
  c.id AS category_id,
  c.slug AS category_slug,
  c.name AS category_name,
  c.icon AS category_icon,
  l.target_time,
  l.difficulty_multiplier,
  l.total_differences
FROM public.levels l
LEFT JOIN public.categories c ON l.category_id = c.id;

ALTER TABLE public.game_records
  ADD COLUMN IF NOT EXISTS base_xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS performance_bonus_xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS achievement_bonus_xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS difficulty_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS replay_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  ADD COLUMN IF NOT EXISTS xp_before_replay INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_bonus_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_first_clear BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_first_s_rating BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS game_mode TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS challenge_date DATE;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_xp BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'game_records_game_mode_check'
      AND conrelid = 'public.game_records'::regclass
  ) THEN
    ALTER TABLE public.game_records
      ADD CONSTRAINT game_records_game_mode_check
      CHECK (game_mode IN ('standard', 'daily'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'game_records_xp_nonnegative_check'
      AND conrelid = 'public.game_records'::regclass
  ) THEN
    ALTER TABLE public.game_records
      ADD CONSTRAINT game_records_xp_nonnegative_check
      CHECK (
        base_xp >= 0
        AND performance_bonus_xp >= 0
        AND achievement_bonus_xp >= 0
        AND xp_before_replay >= 0
        AND xp_earned >= 0
        AND replay_multiplier > 0
        AND replay_multiplier <= 1
      );
  END IF;
END
$$;

-- =====================================================
-- 2. XP audit and aggregation tables
-- =====================================================

CREATE TABLE IF NOT EXISTS public.level_user_stats (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_slug TEXT NOT NULL,
  first_cleared_at TIMESTAMPTZ,
  plays_count INTEGER NOT NULL DEFAULT 0 CHECK (plays_count >= 0),
  best_score INTEGER NOT NULL DEFAULT 0,
  best_performance SMALLINT NOT NULL DEFAULT 0,
  best_rating TEXT NOT NULL DEFAULT 'C' CHECK (best_rating IN ('S+', 'S', 'A', 'B', 'C')),
  best_time INTEGER,
  s_plus_earned_at TIMESTAMPTZ,
  s_earned_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, level_slug)
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
  source_game_record_id UUID REFERENCES public.game_records(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_key)
);

CREATE TABLE IF NOT EXISTS public.xp_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('game_record', 'achievement', 'daily', 'streak', 'admin')),
  source_id UUID,
  amount INTEGER NOT NULL CHECK (amount <> 0),
  balance_after BIGINT NOT NULL CHECK (balance_after >= 0),
  reason TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_level_user_stats_level
  ON public.level_user_stats(level_slug, best_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_time
  ON public.user_achievements(user_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user_time
  ON public.xp_ledger(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_ledger_game_record_once
  ON public.xp_ledger(source_id)
  WHERE source = 'game_record' AND source_id IS NOT NULL;

ALTER TABLE public.level_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own level stats" ON public.level_user_stats;
CREATE POLICY "Users can view their own level stats"
  ON public.level_user_stats FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own XP ledger" ON public.xp_ledger;
CREATE POLICY "Users can view their own XP ledger"
  ON public.xp_ledger FOR SELECT
  USING (auth.uid() = user_id);

GRANT SELECT ON public.level_user_stats TO authenticated;
GRANT SELECT ON public.user_achievements TO authenticated;
GRANT SELECT ON public.xp_ledger TO authenticated;

-- Profiles remain publicly readable for existing leaderboards, but signed-in
-- users may only edit identity fields. Competitive totals and XP are trigger-owned.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (username, display_name, avatar_url) ON public.profiles TO authenticated;

-- Level XP parameters are economy configuration, not player-editable data.
DROP POLICY IF EXISTS "Authenticated users can insert levels" ON public.levels;
DROP POLICY IF EXISTS "Authenticated users can update levels" ON public.levels;
DROP POLICY IF EXISTS "Authenticated users can delete levels" ON public.levels;
DROP POLICY IF EXISTS "Admins can insert levels" ON public.levels;
DROP POLICY IF EXISTS "Admins can update levels" ON public.levels;
DROP POLICY IF EXISTS "Admins can delete levels" ON public.levels;
CREATE POLICY "Admins can insert levels"
  ON public.levels FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admins can update levels"
  ON public.levels FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admins can delete levels"
  ON public.levels FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- =====================================================
-- 3. Level curve and shared helpers
-- =====================================================

-- Level L begins at 100 * (L - 1)^2 total XP.
CREATE OR REPLACE FUNCTION public.xp_required_for_level(p_level INTEGER)
RETURNS BIGINT AS $$
  SELECT (100::BIGINT * GREATEST(p_level - 1, 0)::BIGINT * GREATEST(p_level - 1, 0)::BIGINT);
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(p_total_xp BIGINT)
RETURNS INTEGER AS $$
  SELECT GREATEST(
    1,
    FLOOR(SQRT(GREATEST(COALESCE(p_total_xp, 0), 0)::NUMERIC / 100))::INTEGER + 1
  );
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.calculate_xp_to_next_level(p_total_xp BIGINT)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := public.calculate_level_from_xp(p_total_xp);
  v_remaining BIGINT;
BEGIN
  v_remaining := public.xp_required_for_level(v_level + 1) - GREATEST(COALESCE(p_total_xp, 0), 0);
  RETURN LEAST(GREATEST(v_remaining, 0), 2147483647)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.rating_rank(p_rating TEXT)
RETURNS SMALLINT AS $$
  SELECT CASE p_rating
    WHEN 'S+' THEN 5
    WHEN 'S' THEN 4
    WHEN 'A' THEN 3
    WHEN 'B' THEN 2
    ELSE 1
  END::SMALLINT;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.calculate_current_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_streak INTEGER;
BEGIN
  WITH play_dates AS (
    SELECT DISTINCT (gr.played_at AT TIME ZONE 'UTC')::DATE AS play_date
    FROM public.game_records gr
    WHERE gr.user_id = p_user_id
  ), numbered AS (
    SELECT
      play_date,
      play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::INTEGER AS island
    FROM play_dates
  ), latest AS (
    SELECT MAX(play_date) AS latest_date FROM play_dates
  )
  SELECT CASE
    WHEN latest.latest_date IS NULL OR latest.latest_date < (CURRENT_DATE - 1) THEN 0
    ELSE COUNT(*)::INTEGER
  END
  INTO v_streak
  FROM numbered
  CROSS JOIN latest
  WHERE numbered.island = (
    SELECT island FROM numbered WHERE play_date = latest.latest_date
  )
  GROUP BY latest.latest_date;

  RETURN COALESCE(v_streak, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.calculate_longest_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_longest INTEGER;
BEGIN
  WITH play_dates AS (
    SELECT DISTINCT (gr.played_at AT TIME ZONE 'UTC')::DATE AS play_date
    FROM public.game_records gr
    WHERE gr.user_id = p_user_id
  ), numbered AS (
    SELECT
      play_date,
      play_date - (ROW_NUMBER() OVER (ORDER BY play_date))::INTEGER AS island
    FROM play_dates
  ), streaks AS (
    SELECT COUNT(*)::INTEGER AS length
    FROM numbered
    GROUP BY island
  )
  SELECT COALESCE(MAX(length), 0) INTO v_longest FROM streaks;
  RETURN COALESCE(v_longest, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 4. Authoritative score + XP preparation
-- =====================================================

CREATE OR REPLACE FUNCTION public.prepare_game_record_scoring()
RETURNS TRIGGER AS $$
DECLARE
  v_target_time INTEGER;
  v_total_differences INTEGER;
  v_previous_best INTEGER := 0;
  v_previous_plays INTEGER := 0;
  v_level_id UUID;
  v_level_title TEXT;
  v_level_multiplier NUMERIC(3,2);
  v_s_earned_at TIMESTAMPTZ;
  v_s_plus_earned_at TIMESTAMPTZ;
  v_base_xp INTEGER;
  v_performance_bonus INTEGER;
  v_achievement_bonus INTEGER := 0;
  v_bonus_details JSONB := '{}'::jsonb;
  v_badges JSONB := '[]'::jsonb;
  v_badge TEXT;
  v_achievement_key TEXT;
  v_valid_daily BOOLEAN := false;
  v_has_seven_day_streak BOOLEAN := false;
BEGIN
  SELECT
    l.id,
    l.title,
    COALESCE(
      NULLIF(l.target_time, 0),
      public.calculate_level_target_time(l.difficulty, jsonb_array_length(l.differences))
    ),
    GREATEST(jsonb_array_length(l.differences), 1),
    COALESCE(NULLIF(l.difficulty_multiplier, 0), public.default_difficulty_multiplier(l.difficulty))
  INTO v_level_id, v_level_title, v_target_time, v_total_differences, v_level_multiplier
  FROM public.levels l
  WHERE l.slug = NEW.level_slug;

  IF v_level_id IS NULL THEN
    RAISE EXCEPTION 'Unknown level slug: %', NEW.level_slug;
  END IF;

  -- Server timestamps prevent backdating first clears, daily rewards and streaks.
  NEW.played_at := statement_timestamp();
  NEW.created_at := statement_timestamp();
  NEW.updated_at := statement_timestamp();
  NEW.level_id := v_level_id::TEXT;
  NEW.level_title := v_level_title;
  NEW.target_time := v_target_time;
  NEW.total_differences := v_total_differences;
  NEW.found := LEAST(GREATEST(NEW.found, 0), v_total_differences);
  NEW.total_clicks := GREATEST(NEW.total_clicks, 1);
  NEW.hints_used := GREATEST(NEW.hints_used, 0);
  NEW.time_elapsed := GREATEST(NEW.time_elapsed, 0);
  NEW.max_combo := LEAST(GREATEST(NEW.max_combo, 0), NEW.found);
  NEW.accuracy := LEAST(100, GREATEST(0, NEW.found::NUMERIC / NEW.total_clicks * 100));
  NEW.completion := LEAST(1, GREATEST(0, NEW.found::NUMERIC / v_total_differences));
  NEW.t_score := public.calculate_game_time_score(NEW.time_elapsed, v_target_time);
  NEW.a_score := CASE
    WHEN NEW.accuracy >= 100 THEN 100
    WHEN NEW.accuracy >= 98 THEN 95
    WHEN NEW.accuracy >= 95 THEN 90
    WHEN NEW.accuracy >= 90 THEN 80
    WHEN NEW.accuracy >= 80 THEN 60
    WHEN NEW.accuracy >= 70 THEN 40
    ELSE 20
  END;
  NEW.h_score := CASE NEW.hints_used
    WHEN 0 THEN 100 WHEN 1 THEN 90 WHEN 2 THEN 80
    WHEN 3 THEN 60 WHEN 4 THEN 40 ELSE 20
  END;
  NEW.c_score := CASE
    WHEN NEW.completion >= 1 THEN 100
    WHEN NEW.completion >= 0.8 THEN 70
    WHEN NEW.completion >= 0.6 THEN 40
    ELSE 0
  END;
  NEW.performance := ROUND(
    0.4 * NEW.t_score + 0.3 * NEW.a_score + 0.2 * NEW.h_score + 0.1 * NEW.c_score
  );
  NEW.rating := CASE
    WHEN NEW.performance >= 95 AND NEW.completion >= 1
      AND NEW.hints_used = 0 AND NEW.accuracy >= 98 AND NEW.t_score >= 90 THEN 'S+'
    WHEN NEW.performance >= 90 AND NEW.completion >= 1
      AND NEW.hints_used <= 1 AND NEW.accuracy >= 95 THEN 'S'
    WHEN NEW.performance >= 80 AND NEW.completion >= 1 THEN 'A'
    WHEN NEW.performance >= 70 AND NEW.completion >= 0.8 THEN 'B'
    ELSE 'C'
  END;
  NEW.score := NEW.performance * 30;

  -- All per-user rewards and records share the same transaction lock.
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::TEXT, 0));
  PERFORM 1 FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;

  SELECT
    COALESCE(lus.best_score, 0),
    COALESCE(lus.plays_count, 0),
    lus.s_earned_at,
    lus.s_plus_earned_at
  INTO v_previous_best, v_previous_plays, v_s_earned_at, v_s_plus_earned_at
  FROM public.level_user_stats lus
  WHERE lus.user_id = NEW.user_id AND lus.level_slug = NEW.level_slug
  FOR UPDATE;

  IF NOT FOUND THEN
    v_previous_best := 0;
    v_previous_plays := 0;
    v_s_earned_at := NULL;
    v_s_plus_earned_at := NULL;
  END IF;

  NEW.is_first_clear := v_previous_plays = 0 AND NEW.completion >= 1;
  NEW.is_first_attempt := NEW.is_first_clear;
  NEW.is_new_pb := NEW.score > v_previous_best;
  NEW.score_contribution := GREATEST(NEW.score - v_previous_best, 0);
  NEW.is_first_s_rating :=
    (NEW.rating = 'S' AND v_s_earned_at IS NULL)
    OR (NEW.rating = 'S+' AND v_s_plus_earned_at IS NULL);

  -- Recompute badge output instead of trusting a client-provided JSON array.
  IF NEW.accuracy >= 100 THEN v_badges := v_badges || jsonb_build_array('perfect'); END IF;
  IF NEW.time_elapsed < 60 THEN v_badges := v_badges || jsonb_build_array('speed-demon'); END IF;
  IF NEW.max_combo >= 5 THEN v_badges := v_badges || jsonb_build_array('combo-master'); END IF;
  IF NEW.hints_used = 0 THEN v_badges := v_badges || jsonb_build_array('eagle-eye'); END IF;
  NEW.badges_earned := v_badges;

  v_base_xp := CASE NEW.rating
    WHEN 'S+' THEN 180 WHEN 'S' THEN 150 WHEN 'A' THEN 120
    WHEN 'B' THEN 90 ELSE 60
  END;
  v_performance_bonus := CASE
    WHEN NEW.performance >= 95 THEN 30
    WHEN NEW.performance >= 90 THEN 20
    WHEN NEW.performance >= 85 THEN 15
    WHEN NEW.performance >= 80 THEN 10
    WHEN NEW.performance >= 70 THEN 5
    ELSE 0
  END;

  v_achievement_key := 'no_hint:' || NEW.level_slug;
  IF NEW.hints_used = 0 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = NEW.user_id AND ua.achievement_key = v_achievement_key
  ) THEN
    v_bonus_details := v_bonus_details || jsonb_build_object(v_achievement_key, 20);
    v_achievement_bonus := v_achievement_bonus + 20;
  END IF;

  v_achievement_key := 'perfect_accuracy:' || NEW.level_slug;
  IF NEW.accuracy >= 100 AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = NEW.user_id AND ua.achievement_key = v_achievement_key
  ) THEN
    v_bonus_details := v_bonus_details || jsonb_build_object(v_achievement_key, 15);
    v_achievement_bonus := v_achievement_bonus + 15;
  END IF;

  IF NEW.is_first_s_rating THEN
    v_achievement_key := CASE NEW.rating
      WHEN 'S+' THEN 'first_s_plus:' || NEW.level_slug
      ELSE 'first_s:' || NEW.level_slug
    END;
    v_bonus_details := v_bonus_details || jsonb_build_object(
      v_achievement_key,
      CASE WHEN NEW.rating = 'S+' THEN 30 ELSE 20 END
    );
    v_achievement_bonus := v_achievement_bonus + CASE WHEN NEW.rating = 'S+' THEN 30 ELSE 20 END;
  END IF;

  FOR v_badge IN SELECT jsonb_array_elements_text(v_badges)
  LOOP
    v_achievement_key := 'badge:' || v_badge;
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      WHERE ua.user_id = NEW.user_id AND ua.achievement_key = v_achievement_key
    ) THEN
      v_bonus_details := v_bonus_details || jsonb_build_object(v_achievement_key, 20);
      v_achievement_bonus := v_achievement_bonus + 20;
    END IF;
  END LOOP;

  -- Daily XP is awarded only when the supplied date and level match an active
  -- database-backed daily challenge. Fallback/mock daily pages do not qualify.
  IF NEW.game_mode = 'daily'
    AND NEW.challenge_date IS NOT NULL
    AND to_regclass('public.daily_challenges') IS NOT NULL THEN
    EXECUTE $daily$
      SELECT EXISTS (
        SELECT 1 FROM public.daily_challenges dc
        WHERE dc.challenge_date = $1 AND dc.level_id = $2 AND dc.is_active = true
      )
    $daily$ INTO v_valid_daily USING NEW.challenge_date, v_level_id;
  END IF;

  IF v_valid_daily THEN
    v_achievement_key := 'daily:' || NEW.challenge_date::TEXT;
    IF NOT EXISTS (
      SELECT 1 FROM public.user_achievements ua
      WHERE ua.user_id = NEW.user_id AND ua.achievement_key = v_achievement_key
    ) THEN
      v_bonus_details := v_bonus_details || jsonb_build_object(v_achievement_key, 30);
      v_achievement_bonus := v_achievement_bonus + 30;
    END IF;
  ELSE
    NEW.game_mode := 'standard';
    NEW.challenge_date := NULL;
  END IF;

  SELECT COUNT(*) = 7 INTO v_has_seven_day_streak
  FROM (
    SELECT DISTINCT (gr.played_at AT TIME ZONE 'UTC')::DATE AS play_date
    FROM public.game_records gr
    WHERE gr.user_id = NEW.user_id
      AND (gr.played_at AT TIME ZONE 'UTC')::DATE BETWEEN CURRENT_DATE - 6 AND CURRENT_DATE
    UNION
    SELECT CURRENT_DATE
  ) recent_dates;

  IF v_has_seven_day_streak AND NOT EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = NEW.user_id AND ua.achievement_key = 'streak_7d'
  ) THEN
    v_bonus_details := v_bonus_details || jsonb_build_object('streak_7d', 15);
    v_achievement_bonus := v_achievement_bonus + 15;
  END IF;

  NEW.base_xp := v_base_xp;
  NEW.performance_bonus_xp := v_performance_bonus;
  NEW.achievement_bonus_xp := v_achievement_bonus;
  NEW.difficulty_multiplier := v_level_multiplier;
  NEW.replay_multiplier := CASE WHEN NEW.is_first_clear THEN 1.00 ELSE 0.15 END;
  NEW.xp_bonus_details := v_bonus_details;
  NEW.xp_before_replay := ROUND(
    (v_base_xp + v_performance_bonus + v_achievement_bonus) * v_level_multiplier
  );
  -- One-time achievement bonuses stay valuable on a replay; only the
  -- repeatable Base + Performance portion is reduced to 15%.
  NEW.xp_earned := ROUND(
    (
      (v_base_xp + v_performance_bonus) * NEW.replay_multiplier
      + v_achievement_bonus
    ) * v_level_multiplier
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS prepare_game_record_scoring ON public.game_records;
CREATE TRIGGER prepare_game_record_scoring
  BEFORE INSERT ON public.game_records
  FOR EACH ROW EXECUTE FUNCTION public.prepare_game_record_scoring();

-- =====================================================
-- 5. Atomic accumulation, achievements and ledger
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_old_total_xp BIGINT := 0;
  v_new_total_xp BIGINT;
  v_current_level INTEGER;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_achievement RECORD;
BEGIN
  INSERT INTO public.level_user_stats (
    user_id, level_slug, first_cleared_at, plays_count, best_score,
    best_performance, best_rating, best_time, s_plus_earned_at,
    s_earned_at, updated_at
  ) VALUES (
    NEW.user_id,
    NEW.level_slug,
    CASE WHEN NEW.completion >= 1 THEN NEW.played_at END,
    1,
    NEW.score,
    NEW.performance,
    NEW.rating,
    NEW.time_elapsed,
    CASE WHEN NEW.rating = 'S+' THEN NEW.played_at END,
    CASE WHEN NEW.rating = 'S' THEN NEW.played_at END,
    NOW()
  )
  ON CONFLICT (user_id, level_slug) DO UPDATE SET
    first_cleared_at = COALESCE(public.level_user_stats.first_cleared_at, EXCLUDED.first_cleared_at),
    plays_count = public.level_user_stats.plays_count + 1,
    best_score = GREATEST(public.level_user_stats.best_score, EXCLUDED.best_score),
    best_performance = GREATEST(public.level_user_stats.best_performance, EXCLUDED.best_performance),
    best_rating = CASE
      WHEN public.rating_rank(EXCLUDED.best_rating) > public.rating_rank(public.level_user_stats.best_rating)
        THEN EXCLUDED.best_rating
      ELSE public.level_user_stats.best_rating
    END,
    best_time = LEAST(public.level_user_stats.best_time, EXCLUDED.best_time),
    s_plus_earned_at = COALESCE(public.level_user_stats.s_plus_earned_at, EXCLUDED.s_plus_earned_at),
    s_earned_at = COALESCE(public.level_user_stats.s_earned_at, EXCLUDED.s_earned_at),
    updated_at = NOW();

  FOR v_achievement IN
    SELECT key, value::INTEGER AS raw_xp
    FROM jsonb_each_text(COALESCE(NEW.xp_bonus_details, '{}'::jsonb))
  LOOP
    INSERT INTO public.user_achievements (
      user_id, achievement_key, xp_awarded, source_game_record_id, metadata, unlocked_at
    ) VALUES (
      NEW.user_id,
      v_achievement.key,
      ROUND(v_achievement.raw_xp * NEW.difficulty_multiplier),
      NEW.id,
      jsonb_build_object(
        'raw_xp', v_achievement.raw_xp,
        'difficulty_multiplier', NEW.difficulty_multiplier,
        'level_slug', NEW.level_slug
      ),
      NEW.played_at
    )
    ON CONFLICT (user_id, achievement_key) DO NOTHING;
  END LOOP;

  SELECT COALESCE(p.total_xp, 0)
  INTO v_old_total_xp
  FROM public.profiles p
  WHERE p.id = NEW.user_id
  FOR UPDATE;

  v_new_total_xp := COALESCE(v_old_total_xp, 0) + NEW.xp_earned;
  v_current_level := public.calculate_level_from_xp(v_new_total_xp);
  v_current_streak := public.calculate_current_streak(NEW.user_id);
  v_longest_streak := public.calculate_longest_streak(NEW.user_id);

  UPDATE public.profiles
  SET
    total_games_played = COALESCE(total_games_played, 0) + 1,
    total_score = COALESCE(total_score, 0) + NEW.score_contribution,
    total_stars = COALESCE(total_stars, 0) + NEW.stars,
    total_xp = v_new_total_xp,
    current_level = v_current_level,
    xp_to_next_level = public.calculate_xp_to_next_level(v_new_total_xp),
    current_streak = v_current_streak,
    longest_streak = GREATEST(COALESCE(longest_streak, 0), v_longest_streak),
    unique_badges = (
      SELECT COALESCE(jsonb_agg(to_jsonb(badge) ORDER BY badge), '[]'::jsonb)
      FROM (
        SELECT DISTINCT badge
        FROM jsonb_array_elements_text(
          COALESCE(public.profiles.unique_badges, '[]'::jsonb)
          || COALESCE(NEW.badges_earned, '[]'::jsonb)
        ) AS badge
      ) unique_values
    ),
    updated_at = NOW()
  WHERE id = NEW.user_id;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id, total_games_played, total_score, total_stars, unique_badges,
      total_xp, current_level, xp_to_next_level, current_streak,
      longest_streak, created_at, updated_at
    ) VALUES (
      NEW.user_id, 1, NEW.score_contribution, NEW.stars,
      COALESCE(NEW.badges_earned, '[]'::jsonb),
      v_new_total_xp, v_current_level,
      public.calculate_xp_to_next_level(v_new_total_xp),
      v_current_streak, v_longest_streak, NOW(), NOW()
    );
  END IF;

  INSERT INTO public.xp_ledger (
    user_id, source, source_id, amount, balance_after, reason, metadata, created_at
  ) VALUES (
    NEW.user_id,
    'game_record',
    NEW.id,
    NEW.xp_earned,
    v_new_total_xp,
    CASE WHEN NEW.is_first_clear
      THEN 'First clear: ' || NEW.level_title
      ELSE 'Replay: ' || NEW.level_title
    END,
    jsonb_build_object(
      'level_slug', NEW.level_slug,
      'rating', NEW.rating,
      'base_xp', NEW.base_xp,
      'performance_bonus_xp', NEW.performance_bonus_xp,
      'achievement_bonus_xp', NEW.achievement_bonus_xp,
      'difficulty_multiplier', NEW.difficulty_multiplier,
      'replay_multiplier', NEW.replay_multiplier,
      'bonus_details', NEW.xp_bonus_details
    ),
    NEW.played_at
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_game_record_created ON public.game_records;
CREATE TRIGGER on_game_record_created
  AFTER INSERT ON public.game_records
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_stats();

-- =====================================================
-- 6. Historical backfill
-- =====================================================

-- Clear legacy first-attempt flags before rebuilding them. If two historical
-- rows share the same timestamps, the stable ID tiebreaker can select a
-- different winner than an older migration did; clearing first avoids a
-- transient violation of the partial unique index while that winner changes.
UPDATE public.game_records
SET is_first_attempt = false
WHERE is_first_attempt = true;

WITH ordered AS (
  SELECT
    gr.id,
    gr.user_id,
    gr.level_slug,
    gr.rating,
    gr.hints_used,
    gr.accuracy,
    ROW_NUMBER() OVER (
      PARTITION BY gr.user_id, gr.level_slug
      ORDER BY COALESCE(gr.played_at, gr.created_at) ASC NULLS LAST, gr.created_at ASC NULLS LAST, gr.id
    ) AS attempt_number,
    ROW_NUMBER() OVER (
      PARTITION BY gr.user_id
      ORDER BY COALESCE(gr.played_at, gr.created_at) ASC NULLS LAST, gr.created_at ASC NULLS LAST, gr.id
    ) AS user_sequence
  FROM public.game_records gr
), milestones AS (
  SELECT
    user_id,
    level_slug,
    MIN(user_sequence) FILTER (WHERE hints_used = 0) AS no_hint_sequence,
    MIN(user_sequence) FILTER (WHERE accuracy >= 100) AS perfect_sequence,
    MIN(user_sequence) FILTER (WHERE rating = 'S') AS first_s_sequence,
    MIN(user_sequence) FILTER (WHERE rating = 'S+') AS first_s_plus_sequence
  FROM ordered
  GROUP BY user_id, level_slug
)
UPDATE public.game_records gr
SET
  is_first_clear = ordered.attempt_number = 1,
  is_first_attempt = ordered.attempt_number = 1,
  is_first_s_rating =
    COALESCE(ordered.user_sequence = milestones.first_s_sequence, false)
    OR COALESCE(ordered.user_sequence = milestones.first_s_plus_sequence, false),
  replay_multiplier = CASE WHEN ordered.attempt_number = 1 THEN 1.00 ELSE 0.15 END,
  xp_bonus_details =
    CASE WHEN ordered.user_sequence = milestones.no_hint_sequence
      THEN jsonb_build_object('no_hint:' || gr.level_slug, 20) ELSE '{}'::jsonb END
    || CASE WHEN ordered.user_sequence = milestones.perfect_sequence
      THEN jsonb_build_object('perfect_accuracy:' || gr.level_slug, 15) ELSE '{}'::jsonb END
    || CASE WHEN ordered.user_sequence = milestones.first_s_sequence
      THEN jsonb_build_object('first_s:' || gr.level_slug, 20) ELSE '{}'::jsonb END
    || CASE WHEN ordered.user_sequence = milestones.first_s_plus_sequence
      THEN jsonb_build_object('first_s_plus:' || gr.level_slug, 30) ELSE '{}'::jsonb END
FROM ordered
JOIN milestones
  ON milestones.user_id = ordered.user_id AND milestones.level_slug = ordered.level_slug
WHERE gr.id = ordered.id;

-- Normalize historical badge output with the same rules used for new records.
UPDATE public.game_records gr
SET badges_earned =
  CASE WHEN gr.accuracy >= 100 THEN jsonb_build_array('perfect') ELSE '[]'::jsonb END
  || CASE WHEN gr.time_elapsed < 60 THEN jsonb_build_array('speed-demon') ELSE '[]'::jsonb END
  || CASE WHEN LEAST(GREATEST(gr.max_combo, 0), gr.found) >= 5
    THEN jsonb_build_array('combo-master') ELSE '[]'::jsonb END
  || CASE WHEN gr.hints_used = 0 THEN jsonb_build_array('eagle-eye') ELSE '[]'::jsonb END;

-- First occurrence of every badge is a global one-time achievement.
WITH badge_occurrences AS (
  SELECT
    gr.id AS game_record_id,
    gr.user_id,
    badge.value AS badge,
    ROW_NUMBER() OVER (
      PARTITION BY gr.user_id, badge.value
      ORDER BY COALESCE(gr.played_at, gr.created_at) ASC NULLS LAST, gr.created_at ASC NULLS LAST, gr.id
    ) AS badge_number
  FROM public.game_records gr
  CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(gr.badges_earned, '[]'::jsonb)) badge(value)
), first_badges AS (
  SELECT game_record_id, jsonb_object_agg('badge:' || badge, 20) AS details
  FROM badge_occurrences
  WHERE badge_number = 1
  GROUP BY game_record_id
)
UPDATE public.game_records gr
SET xp_bonus_details = gr.xp_bonus_details || first_badges.details
FROM first_badges
WHERE gr.id = first_badges.game_record_id;

-- Award the first completed seven-day streak found in historical play dates.
WITH play_dates AS (
  SELECT DISTINCT
    gr.user_id,
    (COALESCE(gr.played_at, gr.created_at) AT TIME ZONE 'UTC')::DATE AS play_date
  FROM public.game_records gr
  WHERE COALESCE(gr.played_at, gr.created_at) IS NOT NULL
), numbered AS (
  SELECT
    user_id,
    play_date,
    play_date - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY play_date))::INTEGER AS island
  FROM play_dates
), streak_days AS (
  SELECT
    user_id,
    play_date,
    ROW_NUMBER() OVER (PARTITION BY user_id, island ORDER BY play_date) AS day_in_streak
  FROM numbered
), first_streak_date AS (
  SELECT user_id, MIN(play_date) AS play_date
  FROM streak_days
  WHERE day_in_streak = 7
  GROUP BY user_id
), first_streak_record AS (
  SELECT DISTINCT ON (gr.user_id) gr.id
  FROM public.game_records gr
  JOIN first_streak_date fsd
    ON fsd.user_id = gr.user_id
    AND fsd.play_date = (COALESCE(gr.played_at, gr.created_at) AT TIME ZONE 'UTC')::DATE
  ORDER BY gr.user_id, COALESCE(gr.played_at, gr.created_at), gr.id
)
UPDATE public.game_records gr
SET xp_bonus_details = gr.xp_bonus_details || jsonb_build_object('streak_7d', 15)
FROM first_streak_record fsr
WHERE gr.id = fsr.id;

WITH calculated AS (
  SELECT
    gr.id,
    CASE gr.rating
      WHEN 'S+' THEN 180 WHEN 'S' THEN 150 WHEN 'A' THEN 120
      WHEN 'B' THEN 90 ELSE 60
    END AS base_xp,
    CASE
      WHEN gr.performance >= 95 THEN 30 WHEN gr.performance >= 90 THEN 20
      WHEN gr.performance >= 85 THEN 15 WHEN gr.performance >= 80 THEN 10
      WHEN gr.performance >= 70 THEN 5 ELSE 0
    END AS performance_bonus_xp,
    COALESCE((SELECT SUM(value::INTEGER) FROM jsonb_each_text(gr.xp_bonus_details)), 0)::INTEGER AS achievement_bonus_xp,
    COALESCE(NULLIF(l.difficulty_multiplier, 0), public.default_difficulty_multiplier(l.difficulty)) AS difficulty_multiplier
  FROM public.game_records gr
  JOIN public.levels l ON l.slug = gr.level_slug
)
UPDATE public.game_records gr
SET
  base_xp = calculated.base_xp,
  performance_bonus_xp = calculated.performance_bonus_xp,
  achievement_bonus_xp = calculated.achievement_bonus_xp,
  difficulty_multiplier = calculated.difficulty_multiplier,
  xp_before_replay = ROUND((
    calculated.base_xp + calculated.performance_bonus_xp + calculated.achievement_bonus_xp
  ) * calculated.difficulty_multiplier),
  xp_earned = ROUND((
    (calculated.base_xp + calculated.performance_bonus_xp) * gr.replay_multiplier
    + calculated.achievement_bonus_xp
  ) * calculated.difficulty_multiplier)
FROM calculated
WHERE gr.id = calculated.id;

INSERT INTO public.level_user_stats (
  user_id, level_slug, first_cleared_at, plays_count, best_score,
  best_performance, best_rating, best_time, s_plus_earned_at,
  s_earned_at, updated_at
)
SELECT
  gr.user_id,
  gr.level_slug,
  MIN(COALESCE(gr.played_at, gr.created_at)),
  COUNT(*)::INTEGER,
  MAX(gr.score),
  MAX(gr.performance),
  (ARRAY_AGG(gr.rating ORDER BY public.rating_rank(gr.rating) DESC))[1],
  MIN(gr.time_elapsed),
  MIN(COALESCE(gr.played_at, gr.created_at)) FILTER (WHERE gr.rating = 'S+'),
  MIN(COALESCE(gr.played_at, gr.created_at)) FILTER (WHERE gr.rating = 'S'),
  NOW()
FROM public.game_records gr
GROUP BY gr.user_id, gr.level_slug
ON CONFLICT (user_id, level_slug) DO UPDATE SET
  first_cleared_at = EXCLUDED.first_cleared_at,
  plays_count = EXCLUDED.plays_count,
  best_score = EXCLUDED.best_score,
  best_performance = EXCLUDED.best_performance,
  best_rating = EXCLUDED.best_rating,
  best_time = EXCLUDED.best_time,
  s_plus_earned_at = EXCLUDED.s_plus_earned_at,
  s_earned_at = EXCLUDED.s_earned_at,
  updated_at = NOW();

INSERT INTO public.user_achievements (
  user_id, achievement_key, xp_awarded, source_game_record_id, metadata, unlocked_at
)
SELECT
  gr.user_id,
  bonus.key,
  ROUND(bonus.value::INTEGER * gr.difficulty_multiplier),
  gr.id,
  jsonb_build_object(
    'raw_xp', bonus.value::INTEGER,
    'difficulty_multiplier', gr.difficulty_multiplier,
    'level_slug', gr.level_slug,
    'backfilled', true
  ),
  COALESCE(gr.played_at, gr.created_at, NOW())
FROM public.game_records gr
CROSS JOIN LATERAL jsonb_each_text(gr.xp_bonus_details) bonus
ON CONFLICT (user_id, achievement_key) DO NOTHING;

WITH balances AS (
  SELECT
    gr.id,
    gr.user_id,
    gr.xp_earned,
    gr.level_slug,
    gr.rating,
    gr.is_first_clear,
    gr.base_xp,
    gr.performance_bonus_xp,
    gr.achievement_bonus_xp,
    gr.difficulty_multiplier,
    gr.replay_multiplier,
    gr.xp_bonus_details,
    COALESCE(gr.played_at, gr.created_at, NOW()) AS earned_at,
    SUM(gr.xp_earned) OVER (
      PARTITION BY gr.user_id
      ORDER BY COALESCE(gr.played_at, gr.created_at) ASC NULLS LAST, gr.created_at ASC NULLS LAST, gr.id
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    )::BIGINT AS balance_after
  FROM public.game_records gr
)
INSERT INTO public.xp_ledger (
  user_id, source, source_id, amount, balance_after, reason, metadata, created_at
)
SELECT
  balances.user_id,
  'game_record',
  balances.id,
  balances.xp_earned,
  balances.balance_after,
  CASE WHEN balances.is_first_clear THEN 'First clear' ELSE 'Replay' END,
  jsonb_build_object(
    'level_slug', balances.level_slug,
    'rating', balances.rating,
    'base_xp', balances.base_xp,
    'performance_bonus_xp', balances.performance_bonus_xp,
    'achievement_bonus_xp', balances.achievement_bonus_xp,
    'difficulty_multiplier', balances.difficulty_multiplier,
    'replay_multiplier', balances.replay_multiplier,
    'bonus_details', balances.xp_bonus_details,
    'backfilled', true
  ),
  balances.earned_at
FROM balances
WHERE balances.xp_earned <> 0
ON CONFLICT DO NOTHING;

WITH user_xp AS (
  SELECT gr.user_id, SUM(gr.xp_earned)::BIGINT AS total_xp
  FROM public.game_records gr
  GROUP BY gr.user_id
), user_badges AS (
  SELECT
    gr.user_id,
    COALESCE(jsonb_agg(DISTINCT badge.value), '[]'::jsonb) AS badges
  FROM public.game_records gr
  CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(gr.badges_earned, '[]'::jsonb)) badge(value)
  GROUP BY gr.user_id
)
UPDATE public.profiles p
SET
  total_xp = COALESCE(user_xp.total_xp, 0),
  current_level = public.calculate_level_from_xp(COALESCE(user_xp.total_xp, 0)),
  xp_to_next_level = public.calculate_xp_to_next_level(COALESCE(user_xp.total_xp, 0)),
  current_streak = public.calculate_current_streak(p.id),
  longest_streak = public.calculate_longest_streak(p.id),
  unique_badges = COALESCE(user_badges.badges, p.unique_badges, '[]'::jsonb),
  updated_at = NOW()
FROM user_xp
LEFT JOIN user_badges ON user_badges.user_id = user_xp.user_id
WHERE p.id = user_xp.user_id;

UPDATE public.profiles p
SET
  total_xp = 0,
  current_level = 1,
  xp_to_next_level = 100,
  current_streak = 0,
  longest_streak = 0,
  updated_at = NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.game_records gr WHERE gr.user_id = p.id
);

-- =====================================================
-- 7. Read model for the signed-in user's progress page
-- =====================================================

CREATE OR REPLACE VIEW public.user_xp_progress
WITH (security_invoker = true) AS
SELECT
  p.id AS user_id,
  p.total_xp,
  p.current_level,
  p.xp_to_next_level,
  public.xp_required_for_level(p.current_level) AS current_level_start_xp,
  public.xp_required_for_level(p.current_level + 1) AS next_level_xp,
  p.total_xp - public.xp_required_for_level(p.current_level) AS xp_into_level,
  public.xp_required_for_level(p.current_level + 1)
    - public.xp_required_for_level(p.current_level) AS xp_span,
  p.current_streak,
  p.longest_streak,
  COALESCE(jsonb_array_length(p.unique_badges), 0) AS unique_badges_count,
  (SELECT COUNT(*)::INTEGER FROM public.user_achievements ua WHERE ua.user_id = p.id) AS achievements_count
FROM public.profiles p;

GRANT SELECT ON public.user_xp_progress TO authenticated;

COMMIT;
