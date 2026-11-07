-- Run after levels_schema.sql, daily_challenges_schema.sql and printables_store_schema.sql.
BEGIN;
ALTER TABLE public.levels ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT false;
-- Preserve every installed view column (including optional theme/mode fields).
DO $$
DECLARE view_name text; view_oid regclass; definition text;
BEGIN
 FOREACH view_name IN ARRAY ARRAY['levels_with_category', 'popular_levels', 'featured_levels', 'levels_with_theme'] LOOP
  view_oid := to_regclass('public.' || view_name);
  IF view_oid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid=view_oid AND attname='is_premium' AND NOT attisdropped) THEN
   definition := regexp_replace(pg_get_viewdef(view_oid, true), ';\s*$', '');
   EXECUTE format('CREATE OR REPLACE VIEW public.%I AS SELECT existing.*, premium_level.is_premium FROM (%s) existing JOIN public.levels premium_level ON premium_level.id=existing.id', view_name, definition);
  END IF;
 END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS public.game_premium_subscriptions (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 plan text NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'annual')),
 starts_at timestamptz NOT NULL,
 expires_at timestamptz NOT NULL CHECK (expires_at > starts_at),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.game_premium_redemptions (
 user_id uuid NOT NULL REFERENCES public.game_premium_subscriptions(user_id) ON DELETE CASCADE,
 period_start timestamptz NOT NULL,
 product_id uuid NOT NULL REFERENCES public.printable_products(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id, period_start, product_id)
);
ALTER TABLE public.game_premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_premium_redemptions ENABLE ROW LEVEL SECURITY;
-- Only service_role may write. Users may read their own records.
DROP POLICY IF EXISTS premium_read_own ON public.game_premium_subscriptions;
CREATE POLICY premium_read_own ON public.game_premium_subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS premium_read_own ON public.game_premium_redemptions;
CREATE POLICY premium_read_own ON public.game_premium_redemptions FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE ALL ON public.game_premium_subscriptions, public.game_premium_redemptions FROM anon, authenticated;
GRANT SELECT ON public.game_premium_subscriptions, public.game_premium_redemptions TO authenticated;
GRANT ALL ON public.game_premium_subscriptions, public.game_premium_redemptions TO service_role;

-- UTC arithmetic from the original anchor preserves month-end anniversaries.
CREATE OR REPLACE FUNCTION public.game_premium_period(p_start timestamptz, p_end timestamptz, p_now timestamptz DEFAULT now())
RETURNS TABLE(period_start timestamptz, resets_at timestamptz)
LANGUAGE plpgsql STABLE SET search_path = public SET timezone = 'UTC' AS $$
DECLARE months integer;
BEGIN
 IF p_now < p_start OR p_now >= p_end THEN RETURN; END IF;
 months := (extract(year FROM p_now)::int - extract(year FROM p_start)::int) * 12
   + extract(month FROM p_now)::int - extract(month FROM p_start)::int;
 IF p_start + make_interval(months => months) > p_now THEN months := months - 1; END IF;
 RETURN QUERY SELECT p_start + make_interval(months => months), least(p_end, p_start + make_interval(months => months + 1));
END $$;

CREATE OR REPLACE FUNCTION public.get_game_premium_status()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sub public.game_premium_subscriptions; period record; ids jsonb; used integer;
BEGIN
 SELECT * INTO sub FROM public.game_premium_subscriptions WHERE user_id = auth.uid() AND starts_at <= now() AND expires_at > now();
 IF NOT FOUND THEN
  RETURN jsonb_build_object('active', false, 'plan', null, 'expiresAt', null, 'periodStart', null, 'resetsAt', null, 'remaining', 0, 'redeemedProductIds', '[]'::jsonb);
 END IF;
 SELECT * INTO period FROM public.game_premium_period(sub.starts_at, sub.expires_at);
 SELECT count(*), coalesce(jsonb_agg(product_id), '[]'::jsonb) INTO used, ids
 FROM public.game_premium_redemptions WHERE user_id = sub.user_id AND period_start = period.period_start;
 RETURN jsonb_build_object('active', true, 'plan', sub.plan, 'expiresAt', sub.expires_at,
  'periodStart', period.period_start, 'resetsAt', period.resets_at, 'remaining', greatest(0, 10-used), 'redeemedProductIds', ids);
END $$;

CREATE OR REPLACE FUNCTION public.redeem_game_premium_pack(p_product_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE sub public.game_premium_subscriptions; period record; used integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to redeem a pack'; END IF;
 -- Serializes all redemptions for this member, including different products.
 SELECT * INTO sub FROM public.game_premium_subscriptions WHERE user_id = auth.uid() FOR UPDATE;
 IF NOT FOUND OR sub.starts_at > now() OR sub.expires_at <= now() THEN RAISE EXCEPTION 'An active subscription is required'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.printable_products WHERE id = p_product_id AND published AND is_premium_included AND price_cents > 0)
 THEN RAISE EXCEPTION 'This pack is not eligible'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.printable_product_files WHERE product_id = p_product_id)
 THEN RAISE EXCEPTION 'This pack has no configured files'; END IF;
 -- Existing purchased access always wins and does not consume a credit.
 IF EXISTS (SELECT 1 FROM public.printable_orders WHERE user_id = auth.uid() AND status = 'completed'
  AND ((purchase_type = 'product' AND product_id = p_product_id) OR (purchase_type = 'premium' AND access_expires_at > now())))
 THEN RETURN public.get_game_premium_status(); END IF;
 SELECT * INTO period FROM public.game_premium_period(sub.starts_at, sub.expires_at);
 IF EXISTS (SELECT 1 FROM public.game_premium_redemptions WHERE user_id = sub.user_id AND period_start = period.period_start AND product_id = p_product_id)
 THEN RETURN public.get_game_premium_status(); END IF;
 SELECT count(*) INTO used FROM public.game_premium_redemptions WHERE user_id = sub.user_id AND period_start = period.period_start;
 IF used >= 10 THEN RAISE EXCEPTION 'Monthly pack allowance exhausted'; END IF;
 INSERT INTO public.game_premium_redemptions(user_id, period_start, product_id) VALUES(sub.user_id, period.period_start, p_product_id);
 RETURN public.get_game_premium_status();
END $$;
REVOKE ALL ON FUNCTION public.get_game_premium_status(), public.redeem_game_premium_pack(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_game_premium_status(), public.redeem_game_premium_pack(uuid) TO authenticated;

CREATE TABLE IF NOT EXISTS public.game_premium_interest (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 visitor_id uuid NOT NULL,
 rate_key text NOT NULL,
 request_id uuid NOT NULL UNIQUE,
 plan text NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'annual')),
 price_cents integer NOT NULL CHECK ((plan='monthly' AND price_cents=900) OR (plan='quarterly' AND price_cents=2400) OR (plan='annual' AND price_cents=10000)),
 source text NOT NULL DEFAULT 'direct', level_slug text,
 email text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS premium_interest_rate ON public.game_premium_interest(rate_key, created_at);
CREATE INDEX IF NOT EXISTS premium_interest_visitor ON public.game_premium_interest(visitor_id, created_at);
ALTER TABLE public.game_premium_interest ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.game_premium_interest FROM anon, authenticated;
GRANT ALL ON public.game_premium_interest TO service_role;
-- Server-only RPC combines deduplication, rate limiting and optional email update.
CREATE OR REPLACE FUNCTION public.record_game_premium_interest(p_visitor uuid, p_request uuid, p_plan text, p_source text, p_level text, p_email text, p_rate_key text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result uuid; amount integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_rate_key, 0));
 SELECT id INTO result FROM public.game_premium_interest WHERE request_id=p_request AND visitor_id=p_visitor;
 IF FOUND THEN
  IF p_email IS NOT NULL THEN UPDATE public.game_premium_interest SET email=p_email WHERE id=result; END IF;
  RETURN result;
 END IF;
 SELECT count(*) INTO amount FROM public.game_premium_interest WHERE (visitor_id=p_visitor OR rate_key=p_rate_key) AND created_at > now()-interval '1 day';
 IF amount >= 20 THEN RAISE EXCEPTION 'Too many requests'; END IF;
 INSERT INTO public.game_premium_interest(visitor_id, request_id, plan, price_cents, source, level_slug, email, rate_key)
 VALUES(p_visitor, p_request, p_plan, CASE p_plan WHEN 'monthly' THEN 900 WHEN 'quarterly' THEN 2400 WHEN 'annual' THEN 10000 END, p_source, p_level, p_email, p_rate_key) RETURNING id INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.record_game_premium_interest(uuid, uuid, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_game_premium_interest(uuid, uuid, text, text, text, text, text) TO service_role;

-- Historical daily challenges are preserved. New/changed assignments must be free.
CREATE OR REPLACE FUNCTION public.check_daily_challenge_free() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF EXISTS (SELECT 1 FROM public.levels WHERE id=NEW.level_id AND is_premium) THEN RAISE EXCEPTION 'Daily challenges must use free levels'; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS daily_challenge_free ON public.daily_challenges;
CREATE TRIGGER daily_challenge_free BEFORE INSERT OR UPDATE OF level_id ON public.daily_challenges FOR EACH ROW EXECUTE FUNCTION public.check_daily_challenge_free();
COMMIT;
