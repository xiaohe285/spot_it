import { createRequire } from 'node:module';
import { WaffoPancake } from '@waffo/pancake-ts';
import { createClient } from '@supabase/supabase-js';
import { paymentForCheckout } from './lib/waffo-backfill.mjs';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const apply = process.argv.includes('--apply');
const mode = process.env.WAFFO_ENVIRONMENT || 'test';
if (!['test', 'prod'].includes(mode)) throw new Error('Invalid Waffo environment');
const key = process.env.WAFFO_PRIVATE_KEY || (process.env.WAFFO_PRIVATE_KEY_BASE64 ? Buffer.from(process.env.WAFFO_PRIVATE_KEY_BASE64, 'base64').toString('utf8') : '');
if (!key || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.WAFFO_STORE_ID || !process.env.WAFFO_MERCHANT_ID) throw new Error('Missing server configuration');
const provider = new WaffoPancake({ merchantId: process.env.WAFFO_MERCHANT_ID, privateKey: key, environment: mode });
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
let eligible = 0, unknownAmounts = 0, visited = 0;
try {
  if (apply) {
    const { error } = await admin.from('waffo_premium_payments').select('payment_id').limit(0);
    if (error) throw new Error('Apply waffo_premium_payments_schema.sql before running --apply');
  }
  for (let offset = 0; ; offset += 100) {
    const { data: checkouts, error } = await admin.from('waffo_premium_checkouts')
      .select('id,user_id,order_id,store_id,mode').eq('mode', mode).eq('store_id', process.env.WAFFO_STORE_ID)
      .not('order_id', 'is', null).order('id').range(offset, offset + 99);
    if (error) throw new Error('Unable to read local checkout mappings');
    for (const checkout of checkouts) {
      const result = await provider.graphql.query({
        query: `query ($id: String!) { subscriptionOrder(id: $id) {
          id storeId testMode merchantProvidedBuyerIdentity orderMerchantExternalId
          productVersion { name }
          payments { id orderId status testMode createdAt pspAmountDetails { amount currency } snapshotAmountDetails { currency } }
        } }`, variables: { id: checkout.order_id },
      });
      if (result.errors?.length || !result.data?.subscriptionOrder) throw new Error('Unable to read a mapped Waffo order');
      const order = result.data.subscriptionOrder;
      for (const payment of order.payments) {
        const record = paymentForCheckout(checkout, order, payment);
        if (!record) continue;
        if (apply) {
          const { error } = await admin.rpc('record_waffo_premium_payment', { p_payment: record });
          if (error) throw new Error('Unable to persist a verified payment');
        }
        eligible++; if (record.amount === null) unknownAmounts++;
      }
      visited++;
    }
    if (checkouts.length < 100) break;
  }
  console.log(`${apply ? 'Applied' : 'Dry run'} (${mode}): ${visited} mapped orders, ${eligible} successful payments, ${unknownAmounts} amounts awaiting confirmation.`);
  if (!apply) console.log('No records were written. Use npm run waffo:backfill -- --apply after applying the payment migration.');
} catch (error) {
  // Print only our own bounded diagnostic text; never SDK request/token details.
  console.error(error instanceof Error && !('status' in error) && !error.cause ? error.message : 'Backfill failed. Check Waffo/Supabase connectivity and credentials.');
  process.exitCode = 1;
}
