-- =====================================================
-- Performance V1 + best-score-only global leaderboard
-- =====================================================
-- Run once after schema.sql and levels_schema.sql.
-- Existing inflated totals are recalculated at the end of this migration.

ALTER TABLE public.levels
  ADD COLUMN IF NOT EXISTS target_time INTEGER;

ALTER TABLE public.levels DROP CONSTRAINT IF EXISTS levels_difficulty_check;
ALTER TABLE public.levels ADD CONSTRAINT levels_difficulty_check
  CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert'));

CREATE OR REPLACE FUNCTION public.calculate_level_target_time(
  p_difficulty TEXT,
  p_total_differences INTEGER
)
RETURNS INTEGER AS $$
  SELECT (
    ROUND((
      CASE p_difficulty
        WHEN 'Easy' THEN 20 + GREATEST(p_total_differences, 1) * 12
        WHEN 'Medium' THEN 22 + GREATEST(p_total_differences, 1) * 15
        WHEN 'Hard' THEN 25 + GREATEST(p_total_differences, 1) * 18
        WHEN 'Expert' THEN 30 + GREATEST(p_total_differences, 1) * 24
        ELSE 20 + GREATEST(p_total_differences, 1) * 12
      END
    ) / 5.0) * 5
  )::INTEGER;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.calculate_game_time_score(
  p_time_elapsed INTEGER,
  p_target_time INTEGER
)
RETURNS SMALLINT AS $$
DECLARE
  v_ratio NUMERIC := GREATEST(p_time_elapsed, 0)::NUMERIC / GREATEST(p_target_time, 1);
  v_score NUMERIC;
BEGIN
  v_score := CASE
    WHEN v_ratio <= 0.5 THEN 100
    WHEN v_ratio <= 0.75 THEN 100 - ((v_ratio - 0.5) / 0.25) * 10
    WHEN v_ratio <= 1 THEN 90 - ((v_ratio - 0.75) / 0.25) * 15
    WHEN v_ratio <= 1.5 THEN 75 - ((v_ratio - 1) / 0.5) * 25
    WHEN v_ratio <= 2 THEN 50 - ((v_ratio - 1.5) / 0.5) * 50
    ELSE 0
  END;

  RETURN ROUND(GREATEST(0, LEAST(100, v_score)))::SMALLINT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.set_level_target_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_time IS NULL OR NEW.target_time <= 0 THEN
    NEW.target_time := public.calculate_level_target_time(
      NEW.difficulty,
      jsonb_array_length(NEW.differences)
    );
  ELSIF TG_OP = 'UPDATE'
    AND NEW.target_time IS NOT DISTINCT FROM OLD.target_time
    AND (
      NEW.difficulty IS DISTINCT FROM OLD.difficulty
      OR NEW.differences IS DISTINCT FROM OLD.differences
    ) THEN
    NEW.target_time := public.calculate_level_target_time(
      NEW.difficulty,
      jsonb_array_length(NEW.differences)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_level_target_time ON public.levels;
CREATE TRIGGER set_level_target_time
  BEFORE INSERT OR UPDATE ON public.levels
  FOR EACH ROW EXECUTE FUNCTION public.set_level_target_time();

UPDATE public.levels
SET target_time = public.calculate_level_target_time(
  difficulty,
  jsonb_array_length(differences)
)
WHERE target_time IS NULL OR target_time <= 0;

ALTER TABLE public.game_records
  ADD COLUMN IF NOT EXISTS target_time INTEGER NOT NULL DEFAULT 200,
  ADD COLUMN IF NOT EXISTS found INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_differences INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS completion NUMERIC(4,3) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS t_score SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS a_score SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS h_score SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS c_score SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS performance SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating TEXT NOT NULL DEFAULT 'C',
  ADD COLUMN IF NOT EXISTS is_new_pb BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_first_attempt BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS score_contribution INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'game_records_rating_check'
      AND conrelid = 'public.game_records'::regclass
  ) THEN
    ALTER TABLE public.game_records
      ADD CONSTRAINT game_records_rating_check
      CHECK (rating IN ('S+', 'S', 'A', 'B', 'C'));
  END IF;
END
$$;

-- The database recomputes every competitive field. This keeps the persisted
-- score formula aligned with the UI and makes PB contribution authoritative.
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

  -- Suggested rating followed by the documented hard gates. A failed gate
  -- can only downgrade the rating; it can never promote it.
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

  -- Serialize submissions for one user before reading their current PB. The
  -- global score grows only by the amount that this attempt improves the PB.
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

-- Attempts are append-only. Allowing client-side UPDATE/DELETE would let a
-- player remove a PB and submit it again for another score contribution.
DROP POLICY IF EXISTS "Users can update their own game records" ON public.game_records;
DROP POLICY IF EXISTS "Users can delete their own game records" ON public.game_records;

CREATE OR REPLACE FUNCTION public.update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_games_played = total_games_played + 1,
    total_score = total_score + NEW.score_contribution,
    total_stars = total_stars + NEW.stars,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Normalize historical completed attempts to the same Target Time and T-score
-- rules before rebuilding PB contributions. All current game_records represent
-- completed games, so found/completion can be derived from the level snapshot.
WITH dimensions AS (
  SELECT
    gr.id,
    l.target_time,
    GREATEST(jsonb_array_length(l.differences), 1) AS total_differences,
    LEAST(
      100,
      GREATEST(
        0,
        GREATEST(jsonb_array_length(l.differences), 1)::NUMERIC
          / GREATEST(gr.total_clicks, 1) * 100
      )
    ) AS accuracy,
    public.calculate_game_time_score(gr.time_elapsed, l.target_time) AS t_score,
    CASE
      WHEN GREATEST(jsonb_array_length(l.differences), 1)::NUMERIC
        / GREATEST(gr.total_clicks, 1) * 100 >= 100 THEN 100
      WHEN GREATEST(jsonb_array_length(l.differences), 1)::NUMERIC
        / GREATEST(gr.total_clicks, 1) * 100 >= 98 THEN 95
      WHEN GREATEST(jsonb_array_length(l.differences), 1)::NUMERIC
        / GREATEST(gr.total_clicks, 1) * 100 >= 95 THEN 90
      WHEN GREATEST(jsonb_array_length(l.differences), 1)::NUMERIC
        / GREATEST(gr.total_clicks, 1) * 100 >= 90 THEN 80
      WHEN GREATEST(jsonb_array_length(l.differences), 1)::NUMERIC
        / GREATEST(gr.total_clicks, 1) * 100 >= 80 THEN 60
      WHEN GREATEST(jsonb_array_length(l.differences), 1)::NUMERIC
        / GREATEST(gr.total_clicks, 1) * 100 >= 70 THEN 40
      ELSE 20
    END AS a_score,
    CASE GREATEST(gr.hints_used, 0)
      WHEN 0 THEN 100
      WHEN 1 THEN 90
      WHEN 2 THEN 80
      WHEN 3 THEN 60
      WHEN 4 THEN 40
      ELSE 20
    END AS h_score
  FROM public.game_records gr
  JOIN public.levels l ON l.slug = gr.level_slug
), scored AS (
  SELECT
    dimensions.*,
    ROUND(
      0.4 * t_score +
      0.3 * a_score +
      0.2 * h_score +
      0.1 * 100
    )::SMALLINT AS performance
  FROM dimensions
), finalized AS (
  SELECT
    scored.*,
    CASE
      WHEN performance >= 95
        AND accuracy >= 98
        AND h_score = 100
        AND t_score >= 90 THEN 'S+'
      WHEN performance >= 90
        AND accuracy >= 95
        AND h_score >= 90 THEN 'S'
      WHEN performance >= 80 THEN 'A'
      WHEN performance >= 70 THEN 'B'
      ELSE 'C'
    END AS rating
  FROM scored
)
UPDATE public.game_records gr
SET
  target_time = finalized.target_time,
  found = finalized.total_differences,
  total_differences = finalized.total_differences,
  accuracy = finalized.accuracy,
  completion = 1,
  t_score = finalized.t_score,
  a_score = finalized.a_score,
  h_score = finalized.h_score,
  c_score = 100,
  performance = finalized.performance,
  rating = finalized.rating,
  score = finalized.performance * 30
FROM finalized
WHERE gr.id = finalized.id;

-- Backfill PB markers and contribution audit fields for historical attempts.
WITH ordered_records AS (
  SELECT
    id,
    score,
    COALESCE(
      MAX(score) OVER (
        PARTITION BY user_id, level_slug
        ORDER BY played_at, created_at, id
        ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
      ),
      0
    ) AS previous_best
  FROM public.game_records
)
UPDATE public.game_records gr
SET
  is_new_pb = ordered.score > ordered.previous_best,
  score_contribution = GREATEST(ordered.score - ordered.previous_best, 0)
FROM ordered_records ordered
WHERE gr.id = ordered.id;

-- Preserve only the earliest completed attempt for each user + level pair.
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

-- Repair totals that were previously inflated by summing every replay.
WITH best_scores AS (
  SELECT user_id, level_slug, MAX(score) AS best_score
  FROM public.game_records
  GROUP BY user_id, level_slug
), user_totals AS (
  SELECT user_id, SUM(best_score)::INTEGER AS total_score
  FROM best_scores
  GROUP BY user_id
)
UPDATE public.profiles p
SET
  total_score = COALESCE(t.total_score, 0),
  updated_at = NOW()
FROM user_totals t
WHERE p.id = t.user_id;

UPDATE public.profiles p
SET total_score = 0, updated_at = NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.game_records gr WHERE gr.user_id = p.id
);

-- Expose target_time to the game client through the existing view.
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
  l.target_time
FROM public.levels l
LEFT JOIN public.categories c ON l.category_id = c.id;

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

-- Existing theme installations gain a Medium counter without requiring the
-- whole themes schema (and its policies) to be replayed.
DO $$
BEGIN
  IF to_regclass('public.themes') IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'levels'
        AND column_name = 'theme_id'
    ) THEN
    EXECUTE $view$
      CREATE OR REPLACE VIEW public.themes_with_stats AS
      SELECT
        t.id,
        t.title,
        t.slug,
        t.description,
        t.cover,
        t.seo_title,
        t.seo_description,
        t.published,
        t.created_at,
        t.updated_at,
        COUNT(DISTINCT l.id) AS level_count,
        COUNT(DISTINCT CASE WHEN l.difficulty = 'Easy' THEN l.id END) AS easy_levels,
        COUNT(DISTINCT CASE WHEN l.difficulty = 'Hard' THEN l.id END) AS hard_levels,
        COUNT(DISTINCT CASE WHEN l.difficulty = 'Expert' THEN l.id END) AS expert_levels,
        COALESCE(SUM(l.total_plays), 0) AS total_plays,
        COUNT(DISTINCT CASE WHEN l.difficulty = 'Medium' THEN l.id END) AS medium_levels
      FROM public.themes t
      LEFT JOIN public.levels l
        ON t.id = l.theme_id AND l.published = true
      GROUP BY t.id
    $view$;
  END IF;
END
$$;
