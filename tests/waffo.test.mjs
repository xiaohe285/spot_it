import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { generateKeyPairSync, sign } from 'node:crypto';
import ts from 'typescript';
import { verifyWebhook } from '@waffo/pancake-ts';
import { PGlite } from '@electric-sql/pglite';
const source = readFileSync(new URL('../lib/waffo/events.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { normalizePremiumEvent } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const authSource = readFileSync(new URL('../lib/premium/auth.ts', import.meta.url), 'utf8');
const authOutput = ts.transpileModule(authSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { requestAccessToken, authenticationFailure } = await import(`data:text/javascript;base64,${Buffer.from(authOutput).toString('base64')}`);
const user = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
const store = 'STO_test';
const fixture = (checkout, type='subscription.activated', overrides={}) => ({
  id: 'delivery-order-id', eventId: 'ORD_test', eventType: type, timestamp: '2026-01-31T10:00:00Z', storeId: store, mode: 'test',
  data: { orderId: 'ORD_test', merchantProvidedBuyerIdentity: user, orderMetadata: { app: 'spotdiffs-premium', checkoutId: checkout, planId: 'monthly' }, billingPeriod: 'monthly', currentPeriodStart: '2026-01-31', currentPeriodEnd: '2026-02-28' }, ...overrides,
});

test('SDK verifies raw bytes, rejects tampering, wrong environment and replay', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const pem = publicKey.export({ type: 'spki', format: 'pem' });
  const body = JSON.stringify(fixture(user));
  const now = Date.now();
  const signature = timestamp => `t=${timestamp},v1=${sign('RSA-SHA256',Buffer.from(`${timestamp}.${body}`),privateKey).toString('base64')}`;
  const options = { environment: 'test', publicKeys: { test: pem } };
  assert.equal(verifyWebhook(body, signature(now), options).data.orderId, 'ORD_test');
  assert.throws(() => verifyWebhook(body+' ', signature(now), options));
  assert.throws(() => verifyWebhook(body, signature(now-3600000), options));
  assert.throws(() => verifyWebhook(body, signature(now), { ...options, environment:'prod' }));
});

test('only scoped subscription state events can change access', () => {
  const event = fixture(user);
  assert.equal(normalizePremiumEvent({ ...event, mode:'prod' },store,'test'),null);
  assert.equal(normalizePremiumEvent(event,'STO_other','test'),null);
  assert.equal(normalizePremiumEvent({ ...event,eventType:'subscription.payment_succeeded' },store,'test'),null);
  assert.equal(normalizePremiumEvent({ ...event,data:{ ...event.data,orderMetadata:{} } },store,'test'),null);
  assert.throws(() => normalizePremiumEvent({ ...event,data:{ ...event.data,currentPeriodEnd:undefined } },store,'test'));
  assert.throws(() => normalizePremiumEvent({ ...event,data:{ ...event.data,orderMetadata:{ ...event.data.orderMetadata,checkoutId:'invalid' } } },store,'test'));
  assert.equal(normalizePremiumEvent(event,store,'test').period_end,'2026-02-28T00:00:00.000Z');
});

test('billing transactions are atomic, idempotent, ordered and service-only', async t => {
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      CREATE TABLE levels(id uuid PRIMARY KEY);
      CREATE TABLE daily_challenges(level_id uuid);
      CREATE TABLE printable_products(id uuid PRIMARY KEY,published boolean,is_premium_included boolean,price_cents int);
      CREATE TABLE printable_product_files(product_id uuid);
      CREATE TABLE printable_orders(user_id uuid,status text,purchase_type text,product_id uuid,access_expires_at timestamptz);
    `);
    await db.exec(readFileSync(new URL('../supabase/game_premium_schema.sql',import.meta.url),'utf8'));
    const migration = readFileSync(new URL('../supabase/waffo_premium_schema.sql',import.meta.url),'utf8');
    await db.exec(migration); await db.exec(migration);
    await db.query('INSERT INTO auth.users VALUES ($1),($2)',[user,other]);
    const reserve = async (identity=user,plan='monthly') => (await db.query("SELECT reserve_waffo_checkout($1,$2,'PROD_test','STO_test','test') AS checkout",[identity,plan])).rows[0].checkout;
    const checkout = await reserve();
    const apply = async event => db.query('SELECT apply_waffo_premium_event($1)',[normalizePremiumEvent(event,store,'test')]);
    const sub = async () => (await db.query('SELECT * FROM game_premium_subscriptions WHERE user_id=$1',[user])).rows[0];
    const count = async () => Number((await db.query('SELECT count(*) FROM waffo_premium_events')).rows[0].count);
    await t.test('retries reuse checkout, switching pending plans is blocked',async () => {
      assert.equal((await reserve()).id,checkout.id);
      await assert.rejects(reserve(user,'annual'),/checkout/);
      assert.equal(await sub(),undefined);
    });
    await t.test('ownership failures roll back event deduplication',async () => {
      const bad = fixture(checkout.id); bad.data.merchantProvidedBuyerIdentity=other;
      await assert.rejects(apply(bad),/ownership/);
      assert.equal(await count(),0); assert.equal(await sub(),undefined);
    });
    await t.test('activation grants only provider-confirmed dates and duplicate delivery is harmless',async () => {
      await apply(fixture(checkout.id));
      await apply(fixture(checkout.id));
      assert.equal(await count(),1);
      assert.equal(new Date((await sub()).expires_at).toISOString(),'2026-02-28T00:00:00.000Z');
    });
    await t.test('renewal extends expiry without resetting monthly anchor or credits',async () => {
      const renewal = fixture(checkout.id,'subscription.renewed',{eventId:'ORD_test-renewed-march',timestamp:'2026-02-28T10:00:00Z'});
      renewal.data.currentPeriodStart='2026-02-28'; renewal.data.currentPeriodEnd='2026-03-31';
      await apply(renewal); await apply(renewal);
      assert.equal(new Date((await sub()).starts_at).toISOString(),'2026-01-31T00:00:00.000Z');
      assert.equal(new Date((await sub()).expires_at).toISOString(),'2026-03-31T00:00:00.000Z');
    });
    await t.test('canceling retains paid access and stale cancellation cannot undo newer recovery',async () => {
      const before = (await sub()).expires_at;
      await apply(fixture(checkout.id,'subscription.canceling',{timestamp:'2026-03-01T10:00:00Z'}));
      assert.equal((await sub()).billing_status,'canceling'); assert.equal(+(await sub()).expires_at,+before);
      await apply(fixture(checkout.id,'subscription.uncanceled',{timestamp:'2026-03-03T10:00:00Z'}));
      await apply(fixture(checkout.id,'subscription.canceled',{timestamp:'2026-03-02T10:00:00Z'}));
      assert.equal((await sub()).billing_status,'active');
    });
    await t.test('terminal cancellation revokes access; late activation cannot reactivate it',async () => {
      await apply(fixture(checkout.id,'subscription.canceled',{timestamp:'2026-04-01T10:00:00Z'}));
      await apply(fixture(checkout.id));
      assert.equal((await sub()).billing_status,'canceled');
      assert.ok(new Date((await sub()).expires_at)<new Date());
    });
    await t.test('renewal arriving before activation still restores original anniversary',async () => {
      const second = await reserve(other);
      const renewed = fixture(second.id,'subscription.renewed',{eventId:'ORD_other-renewed',timestamp:'2026-02-28T10:00:00Z'});
      renewed.data.orderId='ORD_other'; renewed.data.merchantProvidedBuyerIdentity=other;
      renewed.data.currentPeriodStart='2026-02-28'; renewed.data.currentPeriodEnd='2026-03-31';
      await apply(renewed);
      const activation = fixture(second.id,'subscription.activated',{eventId:'ORD_other'}); activation.data.orderId='ORD_other'; activation.data.merchantProvidedBuyerIdentity=other;
      await apply(activation);
      const row=(await db.query('SELECT * FROM game_premium_subscriptions WHERE user_id=$1',[other])).rows[0];
      assert.equal(new Date(row.starts_at).toISOString(),'2026-01-31T00:00:00.000Z');
      assert.equal(new Date(row.expires_at).toISOString(),'2026-03-31T00:00:00.000Z');
    });
    await t.test('cancellation request delivered before activation preserves the paid period',async () => {
      const third='00000000-0000-4000-8000-000000000003';
      await db.query('INSERT INTO auth.users VALUES ($1)',[third]);
      const thirdCheckout=await reserve(third);
      const cancel=fixture(thirdCheckout.id,'subscription.canceling',{eventId:'ORD_third',timestamp:'2026-02-01T10:00:00Z'});
      cancel.data.orderId='ORD_third'; cancel.data.merchantProvidedBuyerIdentity=third;
      await apply(cancel);
      const activation=fixture(thirdCheckout.id,'subscription.activated',{eventId:'ORD_third'});
      activation.data.orderId='ORD_third'; activation.data.merchantProvidedBuyerIdentity=third;
      await apply(activation);
      const row=(await db.query('SELECT * FROM game_premium_subscriptions WHERE user_id=$1',[third])).rows[0];
      assert.equal(row.billing_status,'canceling');
      assert.equal(new Date(row.expires_at).toISOString(),'2026-02-28T00:00:00.000Z');
    });
    await t.test('active membership blocks a second subscription',async () => {
      await db.query("UPDATE game_premium_subscriptions SET expires_at=now()+interval '1 year' WHERE user_id=$1",[user]);
      await assert.rejects(reserve(),/membership/);
    });
    await t.test('authenticated users cannot forge billing events or read checkout tokens',async () => {
      await db.exec('SET ROLE authenticated');
      await assert.rejects(db.query('SELECT apply_waffo_premium_event($1)',[{}]),/permission denied/);
      await assert.rejects(reserve(),/permission denied/);
      await assert.rejects(db.exec('SELECT * FROM waffo_premium_checkouts'),/permission denied/);
      await assert.rejects(db.exec('SELECT * FROM waffo_premium_events'),/permission denied/);
      await db.exec('RESET ROLE');
    });
  } finally { await db.close(); }
});

// Exercise the actual route with isolated I/O; no merchant credentials required.
async function loadCheckoutRoute(deps) {
  globalThis.__waffoRouteTest = deps;
  let source = readFileSync(new URL('../app/api/waffo/checkout/route.ts',import.meta.url),'utf8');
  source = source.replace(/^import .*;\n/gm,'');
  source = `const { NextResponse, TaxCategory, createClient, createAdminClient, premiumPlans, isSameOrigin, waffoClient, waffoEnvironment, waffoProductId, waffoSiteUrl, waffoStoreId, requestAccessToken, authenticationFailure } = globalThis.__waffoRouteTest;\n${source}`;
  const { outputText } = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}});
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}

test('checkout route binds server price and account and fails closed',async t => {
  const calls=[];
  let identity={id:user,email:'member@example.com'};
  let rpcError=null;
  let authError=null;
  let verifiedToken;
  const deps={
    requestAccessToken, authenticationFailure,
    NextResponse:{json:(body,options={})=>Response.json(body,options)}, TaxCategory:{DigitalGoods:'digital_goods'},
    createClient:async()=>({auth:{getUser:async token=>{verifiedToken=token;return {data:{user:identity},error:authError};}}}),
    createAdminClient:()=>({rpc:async(name,args)=>{calls.push({name,args});return {data:{id:user},error:rpcError};},from:()=>({update:value=>({eq:async()=>{calls.push({saved:value});return {error:null};}})})}),
    premiumPlans:[{id:'monthly',priceCents:900}], isSameOrigin:request=>request.headers.get('origin')==='https://spotdiffs.test',
    waffoClient:()=>({checkout:{authenticated:{create:async(params,options)=>{calls.push({params,options});return {checkoutUrl:'https://checkout.example/session#token=test',sessionId:'cs_test'};}}}}),
    waffoEnvironment:()=> 'test', waffoProductId:()=> 'PROD_server',waffoSiteUrl:()=> 'https://spotdiffs.test',waffoStoreId:()=>store,
  };
  const {POST}=await loadCheckoutRoute(deps);
  const request=(body,origin='https://spotdiffs.test')=>new Request('https://spotdiffs.test/api/waffo/checkout',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
  await t.test('foreign origin, invalid plans and anonymous requests never create sessions',async()=>{
    assert.equal((await POST(request({plan:'monthly'},'https://evil.test'))).status,403);
    assert.equal((await POST(request({plan:'unknown'}))).status,400);
    identity=null; assert.equal((await POST(request({plan:'monthly'}))).status,401);
    assert.equal(calls.length,0); identity={id:user,email:'member@example.com'};
  });
  await t.test('client price, buyer, product and return URL cannot override trusted values',async()=>{
    const response=await POST(request({plan:'monthly',priceCents:1,buyerIdentity:other,productId:'PROD_bad',successUrl:'https://evil.test'}));
    assert.equal(response.status,200);
    const {params}=calls.find(call=>call.params);
    assert.equal(params.buyerIdentity,user); assert.equal(params.productId,'PROD_server');
    assert.equal(params.priceSnapshot.amount,'9.00'); assert.equal(params.currency,'USD');
    assert.equal(params.successUrl,'https://spotdiffs.test/premium?checkout=returned');
    assert.equal(params.metadata.checkoutId,user);
    assert.equal(response.headers.get('cache-control'),'private, no-store');
    assert.deepEqual(Object.keys(await response.json()),['checkoutUrl']);
  });
  await t.test('browser access tokens are passed to server-side verification',async()=>{
    const input=request({plan:'monthly'}); input.headers.set('authorization','Bearer current-browser-session');
    assert.equal((await POST(input)).status,200);
    assert.equal(verifiedToken,'current-browser-session');
  });
  await t.test('authentication connectivity errors are retryable, not sign-in errors',async()=>{
    calls.length=0; authError={name:'AuthRetryableFetchError',status:0};
    const response=await POST(request({plan:'monthly'}));
    assert.equal(response.status,503);
    assert.equal((await response.json()).code,'AUTH_UNAVAILABLE');
    assert.equal(calls.length,0); authError=null;
  });
  await t.test('invalid or expired tokens cannot create payment sessions',async()=>{
    calls.length=0; authError={name:'AuthApiError',status:401};
    const input=request({plan:'monthly'}); input.headers.set('authorization','Bearer invalid');
    const response=await POST(input);
    assert.equal(response.status,401); assert.equal((await response.json()).code,'SESSION_EXPIRED');
    assert.equal(calls.length,0); authError=null;
  });
  await t.test('database failures never expose internal errors or start payment',async()=>{
    calls.length=0; rpcError={message:'secret internal database detail'};
    const response=await POST(request({plan:'monthly'}));
    assert.equal(response.status,503); assert.equal(JSON.stringify(await response.json()).includes('secret'),false);
    assert.equal(calls.some(call=>call.params),false);
  });
  delete globalThis.__waffoRouteTest;
});
