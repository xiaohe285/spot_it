// Pure mapping shared by the backfill command and its fixture tests.
export function paymentForCheckout(checkout, order, payment) {
  if (!order || order.id !== checkout.order_id || order.storeId !== checkout.store_id
    || order.testMode !== (checkout.mode === 'test')
    || (order.merchantProvidedBuyerIdentity && order.merchantProvidedBuyerIdentity !== checkout.user_id)
    || (order.orderMerchantExternalId && order.orderMerchantExternalId !== checkout.id)) {
    throw new Error('Provider order ownership mismatch');
  }
  if (payment.status !== 'succeeded') return null;
  if (payment.orderId !== order.id || payment.testMode !== order.testMode || !/^PAY_/.test(payment.id)
    || !Number.isFinite(Date.parse(payment.createdAt))) throw new Error('Invalid provider payment');
  const amount = payment.pspAmountDetails?.amount ?? null;
  const currency = payment.pspAmountDetails?.currency || payment.snapshotAmountDetails?.currency;
  if ((amount !== null && (typeof amount !== 'string' || amount.length > 40 || !/^\d+(\.\d+)?$/.test(amount)))
    || !/^[A-Z]{3}$/.test(currency || '')) throw new Error('Invalid actual payment amount');
  return {
    checkout_id: checkout.id, store_id: checkout.store_id, mode: checkout.mode, order_id: order.id,
    payment_id: payment.id, buyer_identity: order.merchantProvidedBuyerIdentity || null,
    product_name: (order.productVersion?.name || 'Premium membership').slice(0, 500),
    amount, currency, paid_at: new Date(payment.createdAt).toISOString(),
  };
}
