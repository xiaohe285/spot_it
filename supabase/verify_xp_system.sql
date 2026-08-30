-- Run after xp_system_migration.sql. The script is read-only and raises an
-- exception when a core XP invariant is broken.

DO $$
BEGIN
  IF to_regclass('public.level_user_stats') IS NULL
    OR to_regclass('public.user_achievements') IS NULL
    OR to_regclass('public.xp_ledger') IS NULL
    OR to_regclass('public.user_xp_progress') IS NULL THEN
    RAISE EXCEPTION 'XP tables or progress view are missing';
  END IF;

  IF public.xp_required_for_level(1) <> 0
    OR public.xp_required_for_level(2) <> 100
    OR public.xp_required_for_level(10) <> 8100
    OR public.calculate_level_from_xp(0) <> 1
    OR public.calculate_level_from_xp(99) <> 1
    OR public.calculate_level_from_xp(100) <> 2
    OR public.calculate_xp_to_next_level(100) <> 300 THEN
    RAISE EXCEPTION 'XP level curve functions returned unexpected values';
  END IF;

  IF has_column_privilege('authenticated', 'public.profiles', 'total_xp', 'UPDATE')
    OR has_column_privilege('authenticated', 'public.profiles', 'current_level', 'UPDATE')
    OR NOT has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE') THEN
    RAISE EXCEPTION 'Profile column privileges do not protect XP fields';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.game_records gr
    WHERE gr.base_xp <> CASE gr.rating
      WHEN 'S+' THEN 180 WHEN 'S' THEN 150 WHEN 'A' THEN 120
      WHEN 'B' THEN 90 ELSE 60
    END
  ) THEN
    RAISE EXCEPTION 'At least one game record has an invalid Base XP';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.game_records gr
    WHERE gr.performance_bonus_xp <> CASE
      WHEN gr.performance >= 95 THEN 30 WHEN gr.performance >= 90 THEN 20
      WHEN gr.performance >= 85 THEN 15 WHEN gr.performance >= 80 THEN 10
      WHEN gr.performance >= 70 THEN 5 ELSE 0
    END
  ) THEN
    RAISE EXCEPTION 'At least one game record has an invalid Performance Bonus';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.game_records gr
    WHERE gr.achievement_bonus_xp <> COALESCE(
      (SELECT SUM(value::INTEGER) FROM jsonb_each_text(gr.xp_bonus_details)),
      0
    )
  ) THEN
    RAISE EXCEPTION 'Achievement Bonus does not match xp_bonus_details';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.game_records gr
    WHERE gr.replay_multiplier <> CASE WHEN gr.is_first_clear THEN 1.00 ELSE 0.15 END
      OR gr.xp_earned <> ROUND((
        (gr.base_xp + gr.performance_bonus_xp) * gr.replay_multiplier
        + gr.achievement_bonus_xp
      ) * gr.difficulty_multiplier)
  ) THEN
    RAISE EXCEPTION 'Replay decay or final XP formula is inconsistent';
  END IF;

  IF EXISTS (
    SELECT user_id, level_slug
    FROM public.game_records
    WHERE is_first_clear
    GROUP BY user_id, level_slug
    HAVING COUNT(*) <> 1
  ) THEN
    RAISE EXCEPTION 'A user has multiple first clears for the same level';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.level_user_stats lus
    LEFT JOIN (
      SELECT
        user_id,
        level_slug,
        COUNT(*)::INTEGER AS plays_count,
        MAX(score) AS best_score,
        MAX(performance) AS best_performance,
        MIN(time_elapsed) AS best_time
      FROM public.game_records
      GROUP BY user_id, level_slug
    ) actual USING (user_id, level_slug)
    WHERE actual.user_id IS NULL
      OR lus.plays_count <> actual.plays_count
      OR lus.best_score <> actual.best_score
      OR lus.best_performance <> actual.best_performance
      OR lus.best_time <> actual.best_time
  ) THEN
    RAISE EXCEPTION 'level_user_stats is not synchronized with game_records';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    LEFT JOIN (
      SELECT user_id, SUM(amount)::BIGINT AS expected_xp
      FROM public.xp_ledger
      GROUP BY user_id
    ) earned ON earned.user_id = p.id
    WHERE p.total_xp <> COALESCE(earned.expected_xp, 0)
      OR p.current_level <> public.calculate_level_from_xp(COALESCE(earned.expected_xp, 0))
      OR p.xp_to_next_level <> public.calculate_xp_to_next_level(COALESCE(earned.expected_xp, 0))
  ) THEN
    RAISE EXCEPTION 'Profile XP or level totals are inconsistent';
  END IF;

  IF EXISTS (
    SELECT gr.id
    FROM public.game_records gr
    LEFT JOIN public.xp_ledger xl
      ON xl.source = 'game_record' AND xl.source_id = gr.id
    WHERE xl.id IS NULL OR xl.amount <> gr.xp_earned
  ) THEN
    RAISE EXCEPTION 'A game record is missing its matching XP ledger entry';
  END IF;

  RAISE NOTICE 'XP system verification passed';
END
$$;
