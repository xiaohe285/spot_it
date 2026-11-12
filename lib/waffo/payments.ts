import type { WebhookEvent } from '@waffo/pancake-ts';

export interface PremiumPaymentInput {
  checkout_id: string;
  store_id: string;
  mode: 'test' | 'prod';
  order_id: string;
  payment_id: string;
  buyer_identity: string | null;
  product_name: string;
  amount: string | null;
  currency: string;
  paid_at: string;
}

export function normalizePremiumPayment(event: WebhookEvent, store: string, mode: 'test' | 'prod'): PremiumPaymentInput | null {
  if (event.storeId !== store || event.mode !== mode || event.eventType !== 'subscription.payment_succeeded') return null;
  const data = event.data;
  if (data?.orderMetadata?.app !== 'spotdiffs-premium') return null;
  const checkout = data.orderMetadata.checkoutId;
  const payment = data.paymentId || event.eventId;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(checkout || '')
    || !data.orderId?.startsWith('ORD_') || !payment?.startsWith('PAY_')
    || !/^[A-Z]{3}$/.test(data.currency || '') || !Number.isFinite(Date.parse(event.timestamp))
    || (data.paymentStatus && data.paymentStatus !== 'succeeded')) throw new Error('Invalid payment event');
  // A plan's list price is not proof of what the buyer was charged.
  const amount = data.chargedAmount ?? null;
  if (amount !== null && (typeof amount !== 'string' || amount.length > 40 || !/^\d+(\.\d+)?$/.test(amount))) throw new Error('Invalid payment amount');
  return {
    checkout_id: checkout, store_id: store, mode, order_id: data.orderId, payment_id: payment,
    buyer_identity: data.merchantProvidedBuyerIdentity || null,
    product_name: (data.productName || 'Premium membership').slice(0, 500),
    amount, currency: data.currency, paid_at: new Date(event.timestamp).toISOString(),
  };
}
