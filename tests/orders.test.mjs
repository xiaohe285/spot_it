import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
import { paymentForCheckout } from '../scripts/lib/waffo-backfill.mjs';
async function load(file) {
  const source=readFileSync(new URL(file,import.meta.url),'utf8');
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}});
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { normalizePremiumPayment }=await load('../lib/waffo/payments.ts');
const { ordersResponse }=await load('../lib/orders/response.ts');
const user='00000000-0000-4000-8000-000000000001', other='00000000-0000-4000-8000-000000000002';
const checkout='00000000-0000-4000-8000-000000000003';
const event=(overrides={})=>({id:'delivery',eventId:'PAY_first',eventType:'subscription.payment_succeeded',storeId:'STO_test',mode:'test',timestamp:'2026-11-10T10:20:30Z',data:{orderId:'ORD_test',paymentId:'PAY_first',paymentStatus:'succeeded',merchantProvidedBuyerIdentity:user,currency:'USD',chargedAmount:'9.00',amount:'100.00',productName:'Premium Monthly',orderMetadata:{app:'spotdiffs-premium',checkoutId:checkout}},...overrides});

test('payment normalization scopes events, preserves actual amounts, and never guesses prices',()=>{
  const e=event(); const result=normalizePremiumPayment(e,'STO_test','test');
  assert.equal(result.amount,'9.00'); assert.equal(result.payment_id,'PAY_first');
  assert.equal(result.paid_at,'2026-11-10T10:20:30.000Z');
  for(const change of [{mode:'prod'},{storeId:'STO_other'},{eventType:'subscription.activated'},{data:{...e.data,orderMetadata:{}}}]) assert.equal(normalizePremiumPayment({...e,...change},'STO_test','test'),null);
  const missing=event();delete missing.data.chargedAmount;
  assert.equal(normalizePremiumPayment(missing,'STO_test','test').amount,null);
  for(const data of [{chargedAmount:'-9'},{chargedAmount:9},{currency:'usd'},{paymentStatus:'failed'},{orderMetadata:{app:'spotdiffs-premium',checkoutId:'bad'}}]) assert.throws(()=>normalizePremiumPayment(event({data:{...e.data,...data}}),'STO_test','test'));
  assert.equal(normalizePremiumPayment(event({data:{...e.data,chargedAmount:'0.00'}}),'STO_test','test').amount,'0.00');
});

test('payment storage is replay-safe, retains early payments, and enforces ownership and RLS',async()=>{
  const db=new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      GRANT USAGE ON SCHEMA auth TO authenticated;
      CREATE TABLE waffo_premium_checkouts(id uuid PRIMARY KEY,user_id uuid,store_id text,mode text,order_id text);
      CREATE TABLE game_premium_subscriptions(user_id uuid);
    `);
    await db.query('INSERT INTO auth.users VALUES($1),($2)',[user,other]);
    await db.query("INSERT INTO waffo_premium_checkouts VALUES($1,$2,'STO_test','test',null)",[checkout,user]);
    const migration=readFileSync(new URL('../supabase/waffo_premium_payments_schema.sql',import.meta.url),'utf8');
    await db.exec(migration); await db.exec(migration);
    const payment=normalizePremiumPayment(event(),'STO_test','test');
    const record=p=>db.query('SELECT record_waffo_premium_payment($1)',[p]);
    await record({...payment,amount:null});
    assert.equal((await db.query('SELECT count(*) FROM game_premium_subscriptions')).rows[0].count,0);
    assert.equal((await db.query('SELECT order_id FROM waffo_premium_checkouts')).rows[0].order_id,'ORD_test');
    await Promise.all([record(payment),record(payment)]);
    const row=(await db.query('SELECT * FROM waffo_premium_payments')).rows[0];
    assert.equal(row.amount,'9.00');assert.equal(row.user_id,user);
    await record({...payment,amount:'99.00'});
    assert.equal((await db.query('SELECT amount FROM waffo_premium_payments')).rows[0].amount,'9.00');
    await record({...payment,payment_id:'PAY_renewal',paid_at:'2026-12-10T10:20:30Z'});
    assert.equal((await db.query('SELECT count(*) FROM waffo_premium_payments')).rows[0].count,2);
    for(const change of [{buyer_identity:other},{store_id:'STO_other'},{mode:'prod'},{order_id:'ORD_other'}]) await assert.rejects(record({...payment,...change}),/ownership/);
    await assert.rejects(record({...payment,payment_id:'PAY_bad',amount:'-1'}),/constraint/);
    assert.equal((await db.query('SELECT count(*) FROM waffo_premium_payments')).rows[0].count,2);
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[user]);
    await db.exec('SET ROLE authenticated');
    assert.equal((await db.query('SELECT * FROM waffo_premium_payments')).rows.length,2);
    await assert.rejects(record(payment),/permission denied/);
    await assert.rejects(db.exec("UPDATE waffo_premium_payments SET amount='1'"),/permission denied/);
    await db.exec('RESET ROLE');
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)",[other]);
    await db.exec('SET ROLE authenticated');
    assert.equal((await db.query('SELECT * FROM waffo_premium_payments')).rows.length,0);
    await db.exec('RESET ROLE; SET ROLE anon');
    await assert.rejects(db.exec('SELECT * FROM waffo_premium_payments'),/permission denied/);
  } finally {await db.close();}
});

test('orders API authorizes before querying, paginates and redacts errors',async()=>{
  let calls=[];
  const rows=Array.from({length:21},(_,i)=>({paymentId:`PAY_${i}`,orderId:'ORD_test',productName:'Premium',amount:'9.00',currency:'USD',paidAt:'2026-11-10T00:00:00Z',mode:'test'}));
  const deps={getUser:async()=>({id:user}),listPayments:async(...args)=>{calls.push(args);return rows;}};
  const request=page=>new Request(`https://example.com/api/orders${page===undefined?'':`?page=${page}`}`);
  for(const page of ['0','-1','1.5','abc','100001']) assert.equal((await ordersResponse(request(page),deps)).status,400);
  assert.equal((await ordersResponse(request(),{...deps,getUser:async()=>null})).status,401);
  assert.equal(calls.length,0);
  const response=await ordersResponse(request('2'),deps);const body=await response.json();
  assert.deepEqual(calls,[[user,20,21]]);assert.equal(body.payments.length,20);assert.equal(body.hasMore,true);assert.equal(body.page,2);
  assert.equal(response.headers.get('cache-control'),'private, no-store');
  assert.equal((await (await ordersResponse(request(),{...deps,listPayments:async()=>[]})).json()).hasMore,false);
  const failed=await ordersResponse(request(),{...deps,getUser:async()=>{throw new Error('secret token');}});
  assert.equal(failed.status,503);assert.equal(JSON.stringify(await failed.json()).includes('secret'),false);
});

test('backfill accepts only successful payments on explicitly mapped owned orders',()=>{
  const local={id:checkout,user_id:user,order_id:'ORD_test',store_id:'STO_test',mode:'test'};
  const order={id:'ORD_test',storeId:'STO_test',testMode:true,merchantProvidedBuyerIdentity:user,orderMerchantExternalId:checkout,productVersion:{name:'Historical Premium'}};
  const paid={id:'PAY_first',orderId:'ORD_test',testMode:true,status:'succeeded',createdAt:'2026-11-10T10:20:30Z',pspAmountDetails:{amount:'7.25',currency:'USD'},snapshotAmountDetails:{currency:'USD',total:'9.00'}};
  assert.equal(paymentForCheckout(local,order,paid).amount,'7.25');
  assert.equal(paymentForCheckout(local,order,{...paid,status:'failed'}),null);
  assert.equal(paymentForCheckout(local,order,{...paid,pspAmountDetails:{currency:'USD'}}).amount,null);
  for(const change of [{id:'ORD_other'},{storeId:'STO_other'},{testMode:false},{merchantProvidedBuyerIdentity:other},{orderMerchantExternalId:'unknown'}]) assert.throws(()=>paymentForCheckout(local,{...order,...change},paid),/ownership/);
  assert.throws(()=>paymentForCheckout(local,order,{...paid,orderId:'ORD_other'}),/Invalid/);
});

test('account badge follows verified membership and keeps order navigation for free users',async()=>{
  const {renderAccount}=await import('./helpers/orders-render.mjs');
  const free=renderAccount({open:true});
  assert.equal(free.includes('Premium member'),false);assert.equal(free.includes('href="/my-orders"'),true);
  assert.equal(renderAccount({active:true}).includes('Premium member'),true);
  assert.equal(renderAccount({active:true,loading:true}).includes('Premium member'),false);
  assert.equal(renderAccount({active:true,error:'Unavailable'}).includes('Premium member'),false);
  assert.equal(renderAccount({user:null,active:true}), '');
  const otherUser=renderAccount({active:false,user:{id:'other',email:'other@example.test',user_metadata:{display_name:'Other'}}});
  assert.equal(otherUser.includes('Jack'),false);assert.equal(otherUser.includes('Premium member'),false);
});

test('orders route scopes service queries to verified user, store and mode and exposes only receipt fields',async()=>{
  const {requestAccessToken,authenticationFailure}=await load('../lib/premium/auth.ts');
  let identity={id:user},authError=null,queried=[];
  const builder={
    select:value=>{queried.push(['select',value]);return builder;},
    eq:(key,value)=>{queried.push(['eq',key,value]);return builder;},
    order:(key)=>{queried.push(['order',key]);return builder;},
    range:async(start,end)=>{queried.push(['range',start,end]);return {data:[{payment_id:'PAY_one',order_id:'ORD_one',product_name:'Premium',amount:'9.00',currency:'USD',paid_at:'2026-11-10',mode:'test',checkout_url:'secret',user_id:other}],error:null};},
  };
  globalThis.__ordersRouteDeps={requestAccessToken,authenticationFailure,ordersResponse,
    waffoStoreId:()=> 'STO_test',waffoEnvironment:()=> 'test',
    createClient:async()=>({auth:{getUser:async()=>({data:{user:identity},error:authError})}}),
    createAdminClient:()=>({from:name=>{queried.push(['table',name]);return builder;}}),
  };
  let source=readFileSync(new URL('../app/api/orders/route.ts',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  source='const {createClient,createAdminClient,requestAccessToken,authenticationFailure,waffoStoreId,waffoEnvironment,ordersResponse}=globalThis.__ordersRouteDeps;\n'+source;
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
  const {GET}=await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
  const request=new Request('https://example.com/api/orders?page=1&user_id='+other);
  const response=await GET(request);const body=await response.json();
  assert.ok(queried.some(row=>row[0]==='eq'&&row[1]==='user_id'&&row[2]===user));
  assert.ok(queried.some(row=>row[0]==='eq'&&row[1]==='store_id'&&row[2]==='STO_test'));
  assert.ok(queried.some(row=>row[0]==='eq'&&row[1]==='mode'&&row[2]==='test'));
  assert.equal(JSON.stringify(body).includes('secret'),false);
  assert.deepEqual(Object.keys(body.payments[0]).sort(),['amount','currency','mode','orderId','paidAt','paymentId','productName']);
  queried=[];identity=null;assert.equal((await GET(request)).status,401);assert.equal(queried.length,0);
  authError={name:'AuthRetryableFetchError',status:0};assert.equal((await GET(request)).status,503);assert.equal(queried.length,0);
  delete globalThis.__ordersRouteDeps;
});
