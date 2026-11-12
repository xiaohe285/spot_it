import { NextResponse } from 'next/server';
import { TaxCategory } from '@waffo/pancake-ts';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { premiumPlans } from '@/lib/premium/plans';
import { isSameOrigin } from '@/lib/premium/request';
import { requestAccessToken, authenticationFailure } from '@/lib/premium/auth';
import { waffoClient, waffoEnvironment, waffoProductId, waffoSiteUrl, waffoStoreId } from '@/lib/waffo/server';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
  if (!isSameOrigin(request)) return reply({ error: 'Invalid request origin.' }, 403);
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid checkout request.' }, 400); }
  const plan = premiumPlans.find(plan => plan.id === body?.plan);
  if (!plan) return reply({ error: 'Choose a valid Premium plan.' }, 400);
  try {
    const accessToken = requestAccessToken(request);
    const supabase = await createClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    const failure = authenticationFailure(authError);
    if (failure) return reply({ error: failure.error, code: failure.code }, failure.status);
    if (!user) return reply({ error: 'Please sign in to continue to checkout.', code: 'SESSION_EXPIRED' }, 401);
    const admin = createAdminClient();
    if (!admin) throw new Error('Missing database configuration');
    const client = waffoClient();
    const productId = waffoProductId(plan.id);
    const mode = waffoEnvironment();
    const { data: checkout, error } = await admin.rpc('reserve_waffo_checkout', {
      p_user: user.id, p_plan: plan.id, p_product: productId, p_store: waffoStoreId(), p_mode: mode,
    });
    if (error) {
      if (error.message.includes('membership') || error.message.includes('checkout')) return reply({ error: error.message }, 409);
      throw error;
    }
    if (checkout.checkout_url) return reply({ checkoutUrl: checkout.checkout_url });
    const session = await client.checkout.authenticated.create({
      productId, currency: 'USD', buyerIdentity: user.id, buyerEmail: user.email,
      successUrl: `${waffoSiteUrl()}/premium?checkout=returned`, expiresInSeconds: 1800, withTrial: false,
      // Prices and ownership are set by the server, never supplied by the browser.
      priceSnapshot: { amount: (plan.priceCents / 100).toFixed(2), taxCategory: TaxCategory.DigitalGoods },
      metadata: { app: 'spotdiffs-premium', checkoutId: checkout.id, planId: plan.id },
      orderMerchantExternalId: checkout.id,
    }, { idempotencyKey: `premium-checkout-${checkout.id}` });
    const { error: saveError } = await admin.from('waffo_premium_checkouts').update({
      checkout_url: session.checkoutUrl, session_id: session.sessionId,
    }).eq('id', checkout.id);
    if (saveError) throw saveError;
    return reply({ checkoutUrl: session.checkoutUrl });
  } catch {
    return reply({ error: 'Checkout is temporarily unavailable. Please try again shortly.' }, 503);
  }
}
