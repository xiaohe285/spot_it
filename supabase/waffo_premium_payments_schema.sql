-- Run after waffo_premium_schema.sql. Safe to reapply.
BEGIN;
CREATE TABLE IF NOT EXISTS public.waffo_premium_payments (
 mode text NOT NULL CHECK(mode IN ('test','prod')),
 store_id text NOT NULL,
 payment_id text NOT NULL CHECK(payment_id LIKE 'PAY\_%' ESCAPE '\'),
 checkout_id uuid NOT NULL REFERENCES public.waffo_premium_checkouts(id) ON DELETE RESTRICT,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 order_id text NOT NULL,
 product_name text NOT NULL,
 -- Display-format decimal strings retain the provider's exact precision.
 amount text CHECK(amount IS NULL OR (length(amount)<=40 AND amount ~ '^[0-9]+(\.[0-9]+)?$')),
 currency text NOT NULL CHECK(currency ~ '^[A-Z]{3}$'),
 paid_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(mode,store_id,payment_id)
);
CREATE INDEX IF NOT EXISTS waffo_payments_user_date ON public.waffo_premium_payments(user_id,mode,store_id,paid_at DESC,payment_id DESC);
ALTER TABLE public.waffo_premium_payments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.waffo_premium_payments FROM anon,authenticated;
GRANT SELECT ON public.waffo_premium_payments TO authenticated;
GRANT ALL ON public.waffo_premium_payments TO service_role;
DROP POLICY IF EXISTS read_own_waffo_payments ON public.waffo_premium_payments;
CREATE POLICY read_own_waffo_payments ON public.waffo_premium_payments FOR SELECT TO authenticated USING(user_id=auth.uid());

CREATE OR REPLACE FUNCTION public.record_waffo_premium_payment(p_payment jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE checkout public.waffo_premium_checkouts;
BEGIN
 SELECT * INTO checkout FROM waffo_premium_checkouts WHERE id=(p_payment->>'checkout_id')::uuid;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown checkout'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(checkout.user_id::text,1));
 SELECT * INTO checkout FROM waffo_premium_checkouts WHERE id=checkout.id FOR UPDATE;
 IF checkout.mode<>p_payment->>'mode' OR checkout.store_id<>p_payment->>'store_id'
  OR (checkout.order_id IS NOT NULL AND checkout.order_id<>p_payment->>'order_id')
  OR (p_payment->>'buyer_identity' IS NOT NULL AND p_payment->>'buyer_identity'<>checkout.user_id::text)
 THEN RAISE EXCEPTION 'Payment ownership mismatch'; END IF;
 IF p_payment->>'payment_id' IS NULL OR p_payment->>'order_id' NOT LIKE 'ORD\_%' ESCAPE '\'
 THEN RAISE EXCEPTION 'Invalid payment identity'; END IF;
 IF EXISTS(SELECT 1 FROM waffo_premium_payments WHERE mode=checkout.mode AND store_id=checkout.store_id AND payment_id=p_payment->>'payment_id' AND checkout_id<>checkout.id)
 THEN RAISE EXCEPTION 'Payment already belongs to another checkout'; END IF;
 -- Binds early payment notifications without granting membership or changing
 -- lifecycle ordering. Activation/renewal still runs through its existing RPC.
 UPDATE waffo_premium_checkouts SET order_id=p_payment->>'order_id' WHERE id=checkout.id AND order_id IS NULL;
 INSERT INTO waffo_premium_payments(mode,store_id,payment_id,checkout_id,user_id,order_id,product_name,amount,currency,paid_at)
 VALUES(checkout.mode,checkout.store_id,p_payment->>'payment_id',checkout.id,checkout.user_id,p_payment->>'order_id',
  coalesce(nullif(p_payment->>'product_name',''),'Premium membership'),p_payment->>'amount',p_payment->>'currency',(p_payment->>'paid_at')::timestamptz)
 ON CONFLICT(mode,store_id,payment_id) DO UPDATE SET amount=coalesce(waffo_premium_payments.amount,excluded.amount)
 WHERE waffo_premium_payments.checkout_id=excluded.checkout_id;
END $$;
REVOKE ALL ON FUNCTION public.record_waffo_premium_payment(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_waffo_premium_payment(jsonb) TO service_role;
COMMIT;
