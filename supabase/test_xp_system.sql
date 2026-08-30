-- Transactional integration test for xp_system_migration.sql.
-- Run only against a disposable/test database after all migrations.

BEGIN;

INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('10000000-0000-0000-0000-000000000001', 'xp-one@example.test', '{"username":"xp-one"}'),
  ('10000000-0000-0000-0000-000000000002', 'xp-streak@example.test', '{"username":"xp-streak"}');

INSERT INTO public.categories (id, slug, name)
VALUES ('20000000-0000-0000-0000-000000000001', 'xp-test', 'XP Test');

INSERT INTO public.levels (
  id, slug, title, category_id, image_url_1, image_url_2,
  differences, difficulty, published
) VALUES (
  '30000000-0000-0000-0000-000000000001',
  'xp-easy-five',
  'XP Easy Five',
  '20000000-0000-0000-0000-000000000001',
  'https://example.test/a.jpg',
  'https://example.test/b.jpg',
  '[{"x":10,"y":10,"radius":5},{"x":20,"y":20,"radius":5},{"x":30,"y":30,"radius":5},{"x":40,"y":40,"radius":5},{"x":50,"y":50,"radius":5}]',
  'Easy',
  true
);

INSERT INTO public.daily_challenges (challenge_date, level_id, is_active)
VALUES (CURRENT_DATE, '30000000-0000-0000-0000-000000000001', true);

-- Client-supplied score/XP/achievement fields are intentionally forged. The
-- BEFORE trigger must replace all of them.
INSERT INTO public.game_records (
  user_id, level_id, level_slug, level_title, score, time_elapsed, accuracy,
  total_clicks, wrong_clicks, hints_used, max_combo, stars, found,
  base_xp, performance_bonus_xp, achievement_bonus_xp, xp_earned,
  is_first_clear, is_first_s_rating, xp_bonus_details
) VALUES (
  '10000000-0000-0000-0000-000000000001', 'forged', 'xp-easy-five', 'Forged',
  999999, 30, 1, 5, 0, 0, 5, 3, 5,
  999, 999, 999, 999999, false, false, '{"forged":999}'
);

-- Ordinary replay: repeatable Base + Performance XP is reduced to 15%.
INSERT INTO public.game_records (
  user_id, level_id, level_slug, level_title, score, time_elapsed, accuracy,
  total_clicks, wrong_clicks, hints_used, max_combo, stars, found
) VALUES (
  '10000000-0000-0000-0000-000000000001', 'forged', 'xp-easy-five', 'Forged',
  1, 30, 1, 5, 0, 0, 5, 3, 5
);

-- Valid daily replay: daily achievement remains full value while repeatable XP
-- is still decayed.
INSERT INTO public.game_records (
  user_id, level_id, level_slug, level_title, score, time_elapsed, accuracy,
  total_clicks, wrong_clicks, hints_used, max_combo, stars, found,
  game_mode, challenge_date
) VALUES (
  '10000000-0000-0000-0000-000000000001', 'forged', 'xp-easy-five', 'Forged',
  1, 30, 1, 5, 0, 0, 5, 3, 5, 'daily', CURRENT_DATE
);

-- Build six historical UTC play dates, then insert today's seventh day. The
-- final completion must unlock streak_7d exactly once.
INSERT INTO public.game_records (
  user_id, level_id, level_slug, level_title, score, time_elapsed, accuracy,
  total_clicks, wrong_clicks, hints_used, max_combo, stars, found
) VALUES (
  '10000000-0000-0000-0000-000000000002', 'forged', 'xp-easy-five', 'Forged',
  1, 90, 1, 6, 1, 1, 2, 2, 5
);
UPDATE public.game_records SET played_at = NOW() - INTERVAL '6 days'
WHERE user_id = '10000000-0000-0000-0000-000000000002';

DO $$
DECLARE
  v_day INTEGER;
  v_record_id UUID;
BEGIN
  FOR v_day IN REVERSE 5..1 LOOP
    INSERT INTO public.game_records (
      user_id, level_id, level_slug, level_title, score, time_elapsed, accuracy,
      total_clicks, wrong_clicks, hints_used, max_combo, stars, found
    ) VALUES (
      '10000000-0000-0000-0000-000000000002', 'forged', 'xp-easy-five', 'Forged',
      1, 90, 1, 6, 1, 1, 2, 2, 5
    ) RETURNING id INTO v_record_id;

    UPDATE public.game_records
    SET played_at = NOW() - make_interval(days => v_day)
    WHERE id = v_record_id;
  END LOOP;
END
$$;

INSERT INTO public.game_records (
  user_id, level_id, level_slug, level_title, score, time_elapsed, accuracy,
  total_clicks, wrong_clicks, hints_used, max_combo, stars, found
) VALUES (
  '10000000-0000-0000-0000-000000000002', 'forged', 'xp-easy-five', 'Forged',
  1, 90, 1, 6, 1, 1, 2, 2, 5
);

DO $$
DECLARE
  v_first public.game_records%ROWTYPE;
  v_second public.game_records%ROWTYPE;
  v_daily public.game_records%ROWTYPE;
  v_profile public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_first
  FROM public.game_records
  WHERE user_id = '10000000-0000-0000-0000-000000000001'
  ORDER BY played_at, id LIMIT 1;

  SELECT * INTO v_second
  FROM public.game_records
  WHERE user_id = '10000000-0000-0000-0000-000000000001'
  ORDER BY played_at, id OFFSET 1 LIMIT 1;

  SELECT * INTO v_daily
  FROM public.game_records
  WHERE user_id = '10000000-0000-0000-0000-000000000001' AND game_mode = 'daily';

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = '10000000-0000-0000-0000-000000000001';

  IF v_first.score <> 3000 OR v_first.rating <> 'S+' OR v_first.performance <> 100 THEN
    RAISE EXCEPTION 'Authoritative score/rating calculation failed';
  END IF;
  IF NOT v_first.is_first_clear OR v_first.replay_multiplier <> 1.00 THEN
    RAISE EXCEPTION 'First clear was not detected';
  END IF;
  IF v_first.base_xp <> 180 OR v_first.performance_bonus_xp <> 30
    OR v_first.achievement_bonus_xp <> 145 OR v_first.xp_earned <> 355 THEN
    RAISE EXCEPTION 'First-clear XP breakdown is incorrect: %', row_to_json(v_first);
  END IF;
  IF v_second.is_first_clear OR v_second.replay_multiplier <> 0.15
    OR v_second.achievement_bonus_xp <> 0 OR v_second.xp_earned <> 32 THEN
    RAISE EXCEPTION 'Replay decay is incorrect: %', row_to_json(v_second);
  END IF;
  IF v_daily.achievement_bonus_xp <> 30 OR v_daily.xp_earned <> 62
    OR NOT (v_daily.xp_bonus_details ? ('daily:' || CURRENT_DATE::TEXT)) THEN
    RAISE EXCEPTION 'Daily XP is incorrect: %', row_to_json(v_daily);
  END IF;
  IF v_profile.total_xp <> 449 OR v_profile.current_level <> 3
    OR v_profile.xp_to_next_level <> 451 THEN
    RAISE EXCEPTION 'Profile XP accumulation/level is incorrect: %', row_to_json(v_profile);
  END IF;
  IF (SELECT COUNT(*) FROM public.xp_ledger WHERE user_id = v_profile.id) <> 3 THEN
    RAISE EXCEPTION 'XP ledger is missing game entries';
  END IF;
  IF (SELECT plays_count FROM public.level_user_stats WHERE user_id = v_profile.id AND level_slug = 'xp-easy-five') <> 3 THEN
    RAISE EXCEPTION 'level_user_stats plays_count is incorrect';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.user_achievements
    WHERE user_id = '10000000-0000-0000-0000-000000000002'
      AND achievement_key = 'streak_7d'
  ) THEN
    RAISE EXCEPTION 'Seven-day streak achievement was not awarded';
  END IF;
END
$$;

ROLLBACK;
