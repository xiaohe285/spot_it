import 'server-only';
import { WaffoPancake } from '@waffo/pancake-ts';
import type { PremiumPlanId } from '@/lib/premium/plans';

export function waffoEnvironment(): 'test' | 'prod' {
  const mode = process.env.WAFFO_ENVIRONMENT || 'test';
  if (mode !== 'test' && mode !== 'prod') throw new Error('Invalid Waffo environment');
  return mode;
}

export function waffoStoreId() {
  const id = process.env.WAFFO_STORE_ID;
  if (!id) throw new Error('Waffo store is not configured');
  return id;
}

export function waffoProductId(plan: PremiumPlanId) {
  const id = process.env[`WAFFO_PRODUCT_${plan.toUpperCase()}`];
  if (!id?.startsWith('PROD_')) throw new Error('Waffo product is not configured');
  return id;
}

export function waffoClient() {
  const merchantId = process.env.WAFFO_MERCHANT_ID;
  const privateKey = process.env.WAFFO_PRIVATE_KEY || (process.env.WAFFO_PRIVATE_KEY_BASE64
    ? Buffer.from(process.env.WAFFO_PRIVATE_KEY_BASE64, 'base64').toString('utf8') : '');
  if (!merchantId || !privateKey || privateKey.includes('<paste-')) throw new Error('Waffo credentials are not configured');
  return new WaffoPancake({ merchantId, privateKey, environment: waffoEnvironment() });
}

export function waffoSiteUrl() {
  const url = new URL(process.env.WAFFO_SITE_URL || 'http://localhost:3000');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid site URL');
  if (waffoEnvironment() === 'prod' && url.protocol !== 'https:') throw new Error('Production requires HTTPS');
  return url.origin;
}
