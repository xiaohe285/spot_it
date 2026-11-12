import type { WebhookEvent } from '@waffo/pancake-ts';

const lifecycle = new Set([
  'subscription.activated', 'subscription.renewed', 'subscription.recovered',
  'subscription.canceling', 'subscription.uncanceled', 'subscription.canceled',
  'subscription.past_due', 'subscription.plan_changed',
]);
const grants = new Set(['subscription.activated', 'subscription.renewed', 'subscription.recovered', 'subscription.plan_changed']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const billingPlans: Record<string, string> = { monthly: 'monthly', quarterly: 'quarterly', yearly: 'annual' };

function timestamp(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value) || !Number.isFinite(Date.parse(value))) throw new Error('Invalid event date');
  return new Date(value).toISOString();
}

// Called only after SDK signature verification. Do not use email as identity.
export function normalizePremiumEvent(event: WebhookEvent, store: string, mode: 'test' | 'prod') {
  if (event.storeId !== store || event.mode !== mode) return null;
  if (!lifecycle.has(event.eventType)) return null;
  const data = event.data;
  if (data?.orderMetadata?.app !== 'spotdiffs-premium') return null;
  const checkoutId = data.orderMetadata.checkoutId;
  if (!uuid.test(checkoutId || '') || !event.id || !event.eventId || !data.orderId?.startsWith('ORD_')) throw new Error('Invalid Premium event');
  const plan = billingPlans[data.billingPeriod || ''] || data.orderMetadata.planId;
  if (!['monthly', 'quarterly', 'annual'].includes(plan)) throw new Error('Invalid plan');
  const start = data.currentPeriodStart ? timestamp(data.currentPeriodStart) : null;
  const end = data.currentPeriodEnd ? timestamp(data.currentPeriodEnd) : null;
  if (grants.has(event.eventType) && (!start || !end || end <= start)) throw new Error('Missing subscription period');
  return {
    delivery_id: event.id, event_id: event.eventId, event_type: event.eventType,
    occurred_at: timestamp(event.timestamp), store_id: store, mode,
    checkout_id: checkoutId, order_id: data.orderId, plan,
    buyer_identity: data.merchantProvidedBuyerIdentity || null,
    period_start: start, period_end: end,
  };
}
