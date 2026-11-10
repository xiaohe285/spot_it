import { verifyWebhook, type WebhookEventData } from '@waffo/pancake-ts';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePremiumPayment } from '@/lib/waffo/payments';
import { normalizePremiumEvent } from '@/lib/waffo/events';
import { waffoEnvironment, waffoStoreId } from '@/lib/waffo/server';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-waffo-signature');
  if (!signature) return new Response('Missing signature', { status: 401 });
  let event;
  try { event = verifyWebhook<WebhookEventData>(body, signature, { environment: waffoEnvironment() }); }
  catch { return new Response('Invalid signature', { status: 401 }); }
  try {
    const normalized = normalizePremiumEvent(event, waffoStoreId(), waffoEnvironment());
    const payment = normalizePremiumPayment(event, waffoStoreId(), waffoEnvironment());
    if (!normalized && !payment) return new Response('OK');
    const admin = createAdminClient();
    if (!admin) throw new Error('Database unavailable');
    // A single short transaction persists both deduplication and entitlement.
    // Acknowledge only after commit so failures remain retryable at Waffo.
    const { error } = payment
      ? await admin.rpc('record_waffo_premium_payment', { p_payment: payment })
      : await admin.rpc('apply_waffo_premium_event', { p_event: normalized });
    if (error) throw error;
    return new Response('OK');
  } catch {
    return new Response('Unable to process event', { status: 503 });
  }
}
