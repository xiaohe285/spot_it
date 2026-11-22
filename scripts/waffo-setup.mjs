import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { WaffoPancake, BillingPeriod, TaxCategory } from '@waffo/pancake-ts';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());

// This bootstrap is deliberately limited to the requested test integration.
if ((process.env.WAFFO_ENVIRONMENT || 'test') !== 'test') throw new Error('waffo:setup only creates TEST products.');
const merchantId = process.env.WAFFO_MERCHANT_ID;
const storeId = process.env.WAFFO_STORE_ID;
const privateKey = process.env.WAFFO_PRIVATE_KEY || (process.env.WAFFO_PRIVATE_KEY_BASE64 ? Buffer.from(process.env.WAFFO_PRIVATE_KEY_BASE64, 'base64').toString('utf8') : '');
if (!merchantId || !storeId || !privateKey || privateKey.includes('<paste-')) {
  console.error('Set WAFFO_MERCHANT_ID, WAFFO_STORE_ID and a real TEST WAFFO_PRIVATE_KEY in .env.local, then rerun.');
  process.exit(1);
}
const client = new WaffoPancake({ merchantId, privateKey, environment: 'test' });
function save(key, value) {
  const file = '.env.local';
  const source = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  writeFileSync(file, pattern.test(source) ? source.replace(pattern, line) : `${source}\n${line}\n`, { mode: 0o600 });
  process.env[key] = value;
}
const plans = [
  ['MONTHLY', 'Monthly', BillingPeriod.Monthly, '9.00'],
  ['QUARTERLY', 'Quarterly', BillingPeriod.Quarterly, '24.00'],
  ['ANNUAL', 'Annual', BillingPeriod.Yearly, '90.00'],
];
try {
  for (const [key, name, billingPeriod, amount] of plans) {
    const env = `WAFFO_PRODUCT_${key}`;
    if (process.env[env]) { console.log(`${env} already configured; keeping existing product.`); continue; }
    const { product } = await client.subscriptionProducts.create({
      storeId, name: `SpotDiffs Premium ${name}`, billingPeriod,
      prices: { USD: { amount, taxCategory: TaxCategory.DigitalGoods } },
      description: 'All Premium puzzles, ad-free browsing, and 10 printable packs per month.',
      metadata: { app: 'spotdiffs-premium', planId: key.toLowerCase() },
    }, { idempotencyKey: `spotdiffs-premium-test-${storeId}-${key}-v${key === 'ANNUAL' ? 2 : 1}` });
    save(env, product.id);
    console.log(`${env}=${product.id}`);
  }
  const site = new URL(process.env.WAFFO_SITE_URL || 'http://localhost:3000');
  if (site.protocol !== 'https:') {
    console.log('Products configured. To register a webhook, set WAFFO_SITE_URL to your public HTTPS/ngrok URL and rerun.');
  } else {
    const events = ['subscription.payment_succeeded', 'subscription.activated', 'subscription.renewed', 'subscription.recovered', 'subscription.canceling', 'subscription.uncanceled', 'subscription.canceled', 'subscription.past_due', 'subscription.plan_changed'];
    const url = `${site.origin}/api/waffo/webhook`;
    if (process.env.WAFFO_WEBHOOK_ID) {
      await client.webhooks.update({ id: process.env.WAFFO_WEBHOOK_ID, url, events });
    } else {
      const registrationKey = createHash('sha256').update(`${storeId}:${site.origin}:test`).digest('hex');
      const { webhook } = await client.webhooks.add({ storeId, channel: 'http', url, events, testMode: true }, { idempotencyKey: `premium-webhook-${registrationKey}` });
      save('WAFFO_WEBHOOK_ID', webhook.id);
    }
    console.log(`Test webhook registered: ${url}`);
  }
} catch (error) {
  // Avoid printing SDK request details, which may contain credentials/tokens.
  const networkCode = error?.cause?.code;
  if (['ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNREFUSED', 'UND_ERR_CONNECT_TIMEOUT'].includes(networkCode)) {
    console.error(`Unable to connect to the Waffo API (${networkCode}). Check DNS/network connectivity, then rerun.`);
  } else {
    console.error(`Waffo setup failed${error?.status ? ` (HTTP ${error.status})` : ''}. Check your TEST credentials and store configuration, then rerun.`);
  }
  process.exitCode = 1;
}
