-- =====================================================
-- Per-level first-attempt leaderboard
-- =====================================================
-- Run after scoring_v2_migration.sql and before xp_system_migration.sql.
-- Do not replay this older trigger migration after the XP migration, because
-- xp_system_migration.sql installs the final combined Score + XP trigger.

BEGIN;

ALTER TABLE public.game_records
  ADD COLUMN IF NOT EXISTS is_first_attempt BOOLEAN NOT NULL DEFAULT false;

-- Mark the earliest persisted completion for every user + level pair. The ID
-- is the final deterministic tie breaker for legacy rows with equal timestamps.
WITH ranked_attempts AS (
  SELECT
    gr.id,
    ROW_NUMBER() OVER (
      PARTITION BY gr.user_id, gr.level_slug
      ORDER BY
        COALESCE(gr.played_at, gr.created_at) ASC NULLS LAST,
        gr.created_at ASC NULLS LAST,
        gr.id ASC
    ) AS attempt_number
  FROM public.game_records gr
)
UPDATE public.game_records gr
SET is_first_attempt = ranked_attempts.attempt_number = 1
FROM ranked_attempts
WHERE gr.id = ranked_attempts.id
  AND gr.is_first_attempt IS DISTINCT FROM (ranked_attempts.attempt_number = 1);

-- The unique index is a final database-level invariant. The trigger below
-- serializes submissions so normal concurrent replays are marked false rather
-- than failing against this constraint.
CREATE UNIQUE INDEX IF NOT EXISTS idx_game_records_one_first_attempt
  ON public.game_records(user_id, level_slug)
  WHERE is_first_attempt = true;

CREATE INDEX IF NOT EXISTS idx_game_records_first_attempt_ranking
  ON public.game_records(
    level_slug,
    score DESC,
    time_elapsed ASC,
    accuracy DESC,
    played_at ASC,
    user_id ASC
  )
  WHERE is_first_attempt = true;

-- Rebuild the authoritative scoring trigger with first-attempt detection. The
-- client cannot set competitive fields, including is_first_attempt.
CREATE OR REPLACE FUNCTION public.prepare_game_record_scoring()
RETURNS TRIGGER AS $$
DECLARE
  v_target_time INTEGER;
  v_total_differences INTEGER;
  v_previous_best INTEGER;
  v_level_id UUID;
  v_level_title TEXT;
BEGIN
  SELECT
    l.id,
    l.title,
    COALESCE(
      NULLIF(l.target_time, 0),
      public.calculate_level_target_time(l.difficulty, jsonb_array_length(l.differences))
    ),
    GREATEST(jsonb_array_length(l.differences), 1)
  INTO v_level_id, v_level_title, v_target_time, v_total_differences
  FROM public.levels l
  WHERE l.slug = NEW.level_slug;

  IF v_level_id IS NULL THEN
    RAISE EXCEPTION 'Unknown level slug: %', NEW.level_slug;
  END IF;

  NEW.level_id := v_level_id::TEXT;
  NEW.level_title := v_level_title;
  NEW.target_time := v_target_time;
  NEW.total_differences := v_total_differences;
  NEW.found := LEAST(GREATEST(NEW.found, 0), v_total_differences);
  NEW.total_clicks := GREATEST(NEW.total_clicks, 1);
  NEW.hints_used := GREATEST(NEW.hints_used, 0);
  NEW.accuracy := LEAST(
    100,
    GREATEST(0, NEW.found::NUMERIC / NEW.total_clicks * 100)
  );
  NEW.completion := LEAST(
    1,
    GREATEST(0, NEW.found::NUMERIC / v_total_differences)
  );
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
    WHEN 0 THEN 100
    WHEN 1 THEN 90
    WHEN 2 THEN 80
    WHEN 3 THEN 60
    WHEN 4 THEN 40
    ELSE 20
  END;
  NEW.c_score := CASE
    WHEN NEW.completion >= 1 THEN 100
    WHEN NEW.completion >= 0.8 THEN 70
    WHEN NEW.completion >= 0.6 THEN 40
    ELSE 0
  END;
  NEW.performance := ROUND(
    0.4 * NEW.t_score +
    0.3 * NEW.a_score +
    0.2 * NEW.h_score +
    0.1 * NEW.c_score
  );

  NEW.rating := CASE
    WHEN NEW.performance >= 95
      AND NEW.completion >= 1
      AND NEW.hints_used = 0
      AND NEW.accuracy >= 98
      AND NEW.t_score >= 90 THEN 'S+'
    WHEN NEW.performance >= 90
      AND NEW.completion >= 1
      AND NEW.hints_used <= 1
      AND NEW.accuracy >= 95 THEN 'S'
    WHEN NEW.performance >= 80 AND NEW.completion >= 1 THEN 'A'
    WHEN NEW.performance >= 70 AND NEW.completion >= 0.8 THEN 'B'
    ELSE 'C'
  END;
  NEW.score := NEW.performance * 30;

  -- The advisory lock also covers the unlikely case where an auth user is
  -- missing a profile row. The profile lock preserves the existing PB flow.
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::TEXT, 0));
  PERFORM 1 FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;

  NEW.is_first_attempt := NOT EXISTS (
    SELECT 1
    FROM public.game_records gr
    WHERE gr.user_id = NEW.user_id
      AND gr.level_slug = NEW.level_slug
  );

  SELECT COALESCE(MAX(gr.score), 0)
  INTO v_previous_best
  FROM public.game_records gr
  WHERE gr.user_id = NEW.user_id
    AND gr.level_slug = NEW.level_slug;

  NEW.is_new_pb := NEW.score > v_previous_best;
  NEW.score_contribution := GREATEST(NEW.score - v_previous_best, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS prepare_game_record_scoring ON public.game_records;
CREATE TRIGGER prepare_game_record_scoring
  BEFORE INSERT ON public.game_records
  FOR EACH ROW EXECUTE FUNCTION public.prepare_game_record_scoring();

CREATE OR REPLACE VIEW public.level_first_attempt_leaderboard
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
FROM public.game_records gr
LEFT JOIN public.profiles p ON p.id = gr.user_id
WHERE gr.is_first_attempt = true;

CREATE OR REPLACE VIEW public.level_first_attempt_stats
WITH (security_invoker = true) AS
SELECT
  gr.level_slug,
  COUNT(*)::INTEGER AS participant_count,
  ROUND(AVG(gr.score))::INTEGER AS average_first_score,
  ROUND(AVG(gr.time_elapsed))::INTEGER AS average_first_time
FROM public.game_records gr
WHERE gr.is_first_attempt = true
GROUP BY gr.level_slug;

GRANT SELECT ON public.level_first_attempt_leaderboard TO anon, authenticated;
GRANT SELECT ON public.level_first_attempt_stats TO anon, authenticated;

COMMIT;
