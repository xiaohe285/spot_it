import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSameOrigin } from '@/lib/premium/request';
import { requestAccessToken, authenticationFailure } from '@/lib/premium/auth';
import { waffoClient, waffoEnvironment } from '@/lib/waffo/server';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
  if (!isSameOrigin(request)) return reply({ error: 'Invalid request origin.' }, 403);
  try {
    const accessToken = requestAccessToken(request);
    const supabase = await createClient(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    const failure = authenticationFailure(authError);
    if (failure) return reply({ error: failure.error, code: failure.code }, failure.status);
    if (!user) return reply({ error: 'Please sign in to manage your subscription.', code: 'SESSION_EXPIRED' }, 401);
    const admin = createAdminClient();
    if (!admin) throw new Error('Database unavailable');
    const { data: sub, error } = await admin.from('game_premium_subscriptions')
      .select('waffo_order_id, waffo_mode').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!sub?.waffo_order_id || sub.waffo_mode !== waffoEnvironment()) return reply({ error: 'No Waffo subscription found.' }, 404);
    const result = await waffoClient().orders.cancelSubscription({ orderId: sub.waffo_order_id });
    return reply({ status: result.status });
  } catch { return reply({ error: 'Unable to cancel renewal. Please try again.' }, 503); }
}
