-- Apply after game_premium_schema.sql. Only the service role may process billing.
BEGIN;
ALTER TABLE public.game_premium_subscriptions
 ADD COLUMN IF NOT EXISTS waffo_order_id text,
 ADD COLUMN IF NOT EXISTS waffo_mode text CHECK (waffo_mode IN ('test', 'prod')),
 ADD COLUMN IF NOT EXISTS waffo_checkout_id uuid,
 ADD COLUMN IF NOT EXISTS billing_status text;

CREATE TABLE IF NOT EXISTS public.waffo_premium_checkouts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 plan text NOT NULL CHECK (plan IN ('monthly', 'quarterly', 'annual')),
 product_id text NOT NULL, store_id text NOT NULL,
 mode text NOT NULL CHECK (mode IN ('test', 'prod')),
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'expired', 'completed')),
 checkout_url text, session_id text, order_id text,
 last_event_at timestamptz, last_event_type text,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now() + interval '30 minutes'
);
CREATE UNIQUE INDEX IF NOT EXISTS waffo_one_pending_checkout ON public.waffo_premium_checkouts(user_id) WHERE status='pending';
CREATE UNIQUE INDEX IF NOT EXISTS waffo_order_unique ON public.waffo_premium_checkouts(mode, order_id) WHERE order_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS public.waffo_premium_events (
 mode text NOT NULL, store_id text NOT NULL, event_type text NOT NULL,
 event_id text NOT NULL, occurred_at timestamptz NOT NULL,
 delivery_id text NOT NULL,
 checkout_id uuid NOT NULL REFERENCES public.waffo_premium_checkouts(id) ON DELETE CASCADE,
 processed_at timestamptz NOT NULL DEFAULT now(),
 -- Some lifecycle events share the same order/delivery ID. Timestamp allows
 -- a later cancel/uncancel cycle while deduplicating retries of the same event.
 PRIMARY KEY (mode, store_id, event_type, event_id, occurred_at)
);
ALTER TABLE public.waffo_premium_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waffo_premium_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.waffo_premium_checkouts, public.waffo_premium_events FROM anon, authenticated;
GRANT ALL ON public.waffo_premium_checkouts, public.waffo_premium_events TO service_role;

CREATE OR REPLACE FUNCTION public.reserve_waffo_checkout(p_user uuid, p_plan text, p_product text, p_store text, p_mode text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE checkout public.waffo_premium_checkouts;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text, 1));
 IF EXISTS (SELECT 1 FROM game_premium_subscriptions WHERE user_id=p_user AND expires_at>now())
 THEN RAISE EXCEPTION 'You already have a Premium membership. Cancel renewal before purchasing again after expiry.'; END IF;
 UPDATE waffo_premium_checkouts SET status='expired' WHERE user_id=p_user AND status='pending' AND expires_at<=now();
 SELECT * INTO checkout FROM waffo_premium_checkouts WHERE user_id=p_user AND status='pending';
 IF FOUND THEN
  IF checkout.plan<>p_plan OR checkout.mode<>p_mode OR checkout.product_id<>p_product OR checkout.store_id<>p_store
  THEN RAISE EXCEPTION 'An existing checkout is pending. Use the same plan or wait 30 minutes before changing plans.'; END IF;
  RETURN to_jsonb(checkout);
 END IF;
 INSERT INTO waffo_premium_checkouts(user_id, plan, product_id, store_id, mode)
 VALUES(p_user, p_plan, p_product, p_store, p_mode) RETURNING * INTO checkout;
 RETURN to_jsonb(checkout);
END $$;

CREATE OR REPLACE FUNCTION public.apply_waffo_premium_event(p_event jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE checkout public.waffo_premium_checkouts; sub public.game_premium_subscriptions;
 at_time timestamptz := (p_event->>'occurred_at')::timestamptz;
 event_type text := p_event->>'event_type'; inserted integer;
 period_start timestamptz := (p_event->>'period_start')::timestamptz;
 period_end timestamptz := (p_event->>'period_end')::timestamptz;
 state text;
BEGIN
 SELECT * INTO checkout FROM waffo_premium_checkouts WHERE id=(p_event->>'checkout_id')::uuid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown checkout'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(checkout.user_id::text, 1));
 SELECT * INTO checkout FROM waffo_premium_checkouts WHERE id=checkout.id FOR UPDATE;
 IF checkout.mode<>p_event->>'mode' OR checkout.store_id<>p_event->>'store_id'
  OR (p_event->>'buyer_identity' IS NOT NULL AND p_event->>'buyer_identity'<>checkout.user_id::text)
  OR (checkout.order_id IS NOT NULL AND checkout.order_id<>p_event->>'order_id')
 THEN RAISE EXCEPTION 'Event ownership mismatch'; END IF;
 IF event_type NOT IN ('subscription.activated','subscription.renewed','subscription.recovered','subscription.canceling','subscription.uncanceled','subscription.canceled','subscription.past_due','subscription.plan_changed')
 THEN RAISE EXCEPTION 'Unsupported event'; END IF;
 IF event_type<>'subscription.plan_changed' AND checkout.plan<>p_event->>'plan'
  AND (checkout.last_event_at IS NULL OR checkout.last_event_at<=at_time)
 THEN RAISE EXCEPTION 'Plan mismatch'; END IF;
 INSERT INTO waffo_premium_events(mode,store_id,event_type,event_id,occurred_at,delivery_id,checkout_id)
 VALUES(checkout.mode,checkout.store_id,event_type,p_event->>'event_id',at_time,p_event->>'delivery_id',checkout.id)
 ON CONFLICT DO NOTHING;
 GET DIAGNOSTICS inserted = ROW_COUNT;
 IF inserted=0 THEN RETURN; END IF;
 -- Stale events may be retained for audit but cannot roll back newer state.
 IF checkout.last_event_at>at_time OR (checkout.last_event_at=at_time AND checkout.last_event_type='subscription.canceled') THEN
  -- A delayed activation can still restore the original monthly anniversary
  -- after a renewal arrived first, without changing the newer status/expiry.
  IF event_type='subscription.activated' AND period_start IS NOT NULL AND period_end>period_start THEN
   IF checkout.last_event_type<>'subscription.canceled' THEN
    -- A cancellation request may arrive before activation. Fulfill the paid
    -- period while retaining the newer renewal/cancellation state.
    INSERT INTO game_premium_subscriptions(user_id,plan,starts_at,expires_at,waffo_order_id,waffo_mode,waffo_checkout_id,billing_status)
    VALUES(checkout.user_id,checkout.plan,period_start,period_end,p_event->>'order_id',checkout.mode,checkout.id,
     CASE checkout.last_event_type WHEN 'subscription.canceling' THEN 'canceling' WHEN 'subscription.past_due' THEN 'past_due' ELSE 'active' END)
    ON CONFLICT(user_id) DO UPDATE SET starts_at=least(game_premium_subscriptions.starts_at,excluded.starts_at)
    WHERE game_premium_subscriptions.waffo_checkout_id=checkout.id;
   ELSE
    UPDATE game_premium_subscriptions SET starts_at=least(starts_at,period_start)
    WHERE user_id=checkout.user_id AND waffo_checkout_id=checkout.id;
   END IF;
  END IF;
  RETURN;
 END IF;
 UPDATE waffo_premium_checkouts SET status='completed', order_id=p_event->>'order_id', last_event_at=at_time, last_event_type=event_type,
  plan=CASE WHEN event_type='subscription.plan_changed' THEN p_event->>'plan' ELSE plan END
 WHERE id=checkout.id;
 SELECT * INTO sub FROM game_premium_subscriptions WHERE user_id=checkout.user_id FOR UPDATE;
 IF FOUND AND sub.waffo_checkout_id IS DISTINCT FROM checkout.id AND EXISTS (
  SELECT 1 FROM waffo_premium_checkouts newer WHERE newer.id=sub.waffo_checkout_id AND newer.created_at>checkout.created_at
 ) THEN RETURN; END IF;
 state := CASE event_type WHEN 'subscription.canceling' THEN 'canceling' WHEN 'subscription.canceled' THEN 'canceled' WHEN 'subscription.past_due' THEN 'past_due' ELSE 'active' END;
 IF event_type IN ('subscription.activated','subscription.renewed','subscription.recovered','subscription.uncanceled','subscription.plan_changed') THEN
  IF event_type='subscription.uncanceled' AND sub.waffo_checkout_id=checkout.id THEN
   period_start:=coalesce(period_start,sub.starts_at); period_end:=coalesce(period_end,sub.expires_at);
  END IF;
  IF period_start IS NULL OR period_end IS NULL OR period_end<=period_start THEN RAISE EXCEPTION 'Missing subscription period'; END IF;
  INSERT INTO game_premium_subscriptions(user_id,plan,starts_at,expires_at,waffo_order_id,waffo_mode,waffo_checkout_id,billing_status)
  VALUES(checkout.user_id,p_event->>'plan',period_start,period_end,p_event->>'order_id',checkout.mode,checkout.id,state)
  ON CONFLICT(user_id) DO UPDATE SET
   plan=excluded.plan,
   starts_at=CASE WHEN game_premium_subscriptions.waffo_checkout_id=checkout.id THEN least(game_premium_subscriptions.starts_at,excluded.starts_at) ELSE excluded.starts_at END,
   expires_at=excluded.expires_at, waffo_order_id=excluded.waffo_order_id,
   waffo_mode=excluded.waffo_mode, waffo_checkout_id=excluded.waffo_checkout_id, billing_status=state;
 ELSIF sub.waffo_checkout_id=checkout.id THEN
  UPDATE game_premium_subscriptions SET billing_status=state,
   expires_at=CASE WHEN state='canceled' THEN greatest(starts_at+interval '1 microsecond',least(expires_at,at_time,now())) ELSE expires_at END
  WHERE user_id=checkout.user_id;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.reserve_waffo_checkout(uuid,text,text,text,text), public.apply_waffo_premium_event(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_waffo_checkout(uuid,text,text,text,text), public.apply_waffo_premium_event(jsonb) TO service_role;

-- Keep the existing access/credit contract, adding cancellation UI information.
CREATE OR REPLACE FUNCTION public.get_game_premium_status()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE sub public.game_premium_subscriptions; period record; ids jsonb; used integer;
BEGIN
 SELECT * INTO sub FROM game_premium_subscriptions WHERE user_id=auth.uid() AND starts_at<=now() AND expires_at>now();
 IF NOT FOUND THEN RETURN jsonb_build_object('active',false,'plan',null,'expiresAt',null,'periodStart',null,'resetsAt',null,'remaining',0,'redeemedProductIds','[]'::jsonb); END IF;
 SELECT * INTO period FROM game_premium_period(sub.starts_at,sub.expires_at);
 SELECT count(*),coalesce(jsonb_agg(product_id),'[]'::jsonb) INTO used,ids FROM game_premium_redemptions WHERE user_id=sub.user_id AND period_start=period.period_start;
 RETURN jsonb_build_object('active',true,'plan',sub.plan,'expiresAt',sub.expires_at,'periodStart',period.period_start,'resetsAt',period.resets_at,'remaining',greatest(0,10-used),'redeemedProductIds',ids,
  'billingStatus',sub.billing_status,'waffoMode',sub.waffo_mode,'canCancel',sub.waffo_order_id IS NOT NULL AND sub.billing_status IN ('active','past_due'));
END $$;
COMMIT;
