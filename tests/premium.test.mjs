import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

async function typeScriptUrl(file) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  let { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
  for (const match of [...outputText.matchAll(/from ['"](\.[^'"]+)['"]/g)]) {
    const dependency = new URL(`${match[1]}.ts`, new URL(file, import.meta.url));
    outputText = outputText.replace(match[0], `from '${await typeScriptUrl(dependency)}'`);
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
}
async function loadTypeScript(file) { return import(await typeScriptUrl(file)); }
const { subscriptionPeriod } = await loadTypeScript('../lib/premium/period.ts');
const { premiumPlans } = await loadTypeScript('../lib/premium/plans.ts');

test('plans bill the correct complete period, with monthly first', () => {
  assert.deepEqual(premiumPlans.map(plan => [plan.id, plan.priceCents, plan.months]), [['monthly', 900, 1], ['quarterly', 2400, 3], ['annual', 10000, 12]]);
  assert.equal(premiumPlans[1].priceCents / premiumPlans[1].months, 800);
});
test('month-end anniversary returns to the original anchor after February', () => {
  assert.deepEqual(subscriptionPeriod('2026-01-31T10:20:30Z', '2027-01-31T10:20:30Z', new Date('2026-02-28T10:20:30Z')), { start: '2026-02-28T10:20:30.000Z', end: '2026-03-31T10:20:30.000Z' });
  assert.equal(subscriptionPeriod('2026-01-31T10:20:30Z', '2027-01-31T10:20:30Z', new Date('2026-03-30T10:20:30Z')).start, '2026-02-28T10:20:30.000Z');
});
test('leap day, exact boundaries, not-started and expired memberships', () => {
  assert.equal(subscriptionPeriod('2024-01-31T00:00:00Z', '2025-01-31T00:00:00Z', new Date('2024-02-29T00:00:00Z')).start, '2024-02-29T00:00:00.000Z');
  assert.equal(subscriptionPeriod('2026-01-31T00:00:00Z', '2026-02-28T00:00:00Z', new Date('2026-02-28T00:00:00Z')), null);
  assert.equal(subscriptionPeriod('2026-01-31T00:00:00Z', '2026-02-28T00:00:00Z', new Date('2026-01-30T00:00:00Z')), null);
});
test('quarterly and annual allowances refresh monthly, final period is clipped at expiry', () => {
  for (const end of ['2026-04-15T12:00:00Z', '2027-01-15T12:00:00Z']) {
    assert.deepEqual(subscriptionPeriod('2026-01-15T12:00:00Z', end, new Date('2026-02-20T00:00:00Z')), { start: '2026-02-15T12:00:00.000Z', end: '2026-03-15T12:00:00.000Z' });
  }
  assert.equal(subscriptionPeriod('2026-01-15T12:00:00Z', '2026-02-20T12:00:00Z', new Date('2026-02-19T00:00:00Z')).end, '2026-02-20T12:00:00.000Z');
});

test('same-origin validation supports a proxy hostname but rejects foreign origins', async () => {
  const { isSameOrigin } = await loadTypeScript('../lib/premium/request.ts');
  const request = origin => new Request('http://localhost:3000/api/premium/interest', { headers: { host: 'spotdiffs.com', 'x-forwarded-proto': 'https', origin } });
  assert.equal(isSameOrigin(request('https://spotdiffs.com')), true);
  assert.equal(isSameOrigin(request('https://invalid.test')), false);
  assert.equal(isSameOrigin(request('http://spotdiffs.com')), false);
  assert.equal(isSameOrigin(new Request('https://spotdiffs.com/api/premium/interest')), false);
});

test('Postgres migration, permissions and pack quota RPC', async t => {
  const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE SCHEMA auth;
      CREATE TABLE auth.users(id uuid PRIMARY KEY);
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      GRANT USAGE ON SCHEMA auth TO authenticated;
      GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;
      CREATE TABLE public.levels(id uuid PRIMARY KEY, slug text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text, title text, mode text, theme_id uuid);
      CREATE VIEW public.levels_with_category AS SELECT id, title, mode, theme_id FROM public.levels;
      CREATE VIEW public.featured_levels AS SELECT * FROM public.levels_with_category;
      CREATE VIEW public.popular_levels AS SELECT * FROM public.levels_with_category;
      CREATE VIEW public.levels_with_theme AS SELECT *, 'theme'::text AS theme_title FROM public.levels;
      CREATE TABLE public.printable_products(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), published boolean DEFAULT true, is_premium_included boolean DEFAULT true, price_cents integer DEFAULT 100);
      CREATE TABLE public.printable_product_files(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid REFERENCES public.printable_products(id));
      CREATE TABLE public.printable_orders(user_id uuid, status text, purchase_type text, product_id uuid, access_expires_at timestamptz);
      CREATE TABLE public.daily_challenges(id uuid DEFAULT gen_random_uuid(), level_id uuid REFERENCES public.levels(id));
    `);
    const migration = readFileSync(new URL('../supabase/game_premium_schema.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration); // Idempotent with dependent and theme views installed.
    const user = '00000000-0000-4000-8000-000000000001';
    await db.exec(`INSERT INTO auth.users VALUES ('${user}'); SELECT set_config('request.jwt.claim.sub','${user}',false); INSERT INTO game_premium_subscriptions VALUES ('${user}', 'annual', now()-interval '1 day', now()+interval '1 year');`);
    await t.test('Premium content is service-only even for active members; migration is repeatable', async () => {
      const sql = readFileSync(new URL('../supabase/premium_level_content_schema.sql', import.meta.url), 'utf8');
      await db.exec(sql);
      await db.exec(sql);
      const level = '00000000-0000-4000-8000-000000000020';
      await db.query('INSERT INTO levels(id, slug, is_premium) VALUES ($1, $2, true)', [level, level]);
      await db.exec('SET ROLE service_role');
      await db.query("INSERT INTO premium_level_content VALUES ($1, 'https://example.com/real.jpg', null, '[]')", [level]);
      assert.equal((await db.query('SELECT * FROM premium_level_content')).rows.length, 1);
      await db.exec('RESET ROLE');
      // Same authenticated role with and without an active subscription.
      for (const [role, identity] of [['anon', ''], ['authenticated', '00000000-0000-4000-8000-000000000002'], ['authenticated', user]]) {
        await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [identity]);
        await db.exec(`SET ROLE ${role}`);
        for (const statement of [
          'SELECT * FROM premium_level_content',
          "INSERT INTO premium_level_content VALUES ('00000000-0000-4000-8000-000000000021', 'https://example.com/x', null, '[]')",
          "UPDATE premium_level_content SET image_url_1='https://example.com/stolen'",
          'DELETE FROM premium_level_content',
        ]) await assert.rejects(db.exec(statement), /permission denied/);
        await db.exec('RESET ROLE');
      }
      await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [user]);
      await db.exec('SET ROLE service_role');
      await db.query('UPDATE premium_level_content SET image_url_2=image_url_1 WHERE slug=$1', [level]);
      await db.exec('RESET ROLE');
      await db.query('DELETE FROM levels WHERE id=$1', [level]);
      assert.equal((await db.query('SELECT * FROM premium_level_content')).rows.length, 0);
      const views = (await db.query("SELECT view_definition FROM information_schema.views WHERE table_schema='public'")).rows;
      assert.equal(views.some(view => view.view_definition.includes('premium_level_content')), false);
    });
    const packs = (await db.query('INSERT INTO printable_products(id) SELECT gen_random_uuid() FROM generate_series(1,12) RETURNING id')).rows.map(row => row.id);
    for (const pack of packs) await db.query('INSERT INTO printable_product_files(product_id) VALUES ($1),($1)', [pack]);
    const status = async () => (await db.query('SELECT get_game_premium_status() AS status')).rows[0].status;
    const redeem = async pack => (await db.query('SELECT redeem_game_premium_pack($1) AS status', [pack])).rows[0].status;
    await t.test('pack with two files consumes one credit; repeated redemption is free', async () => {
      assert.equal((await redeem(packs[0])).remaining, 9);
      assert.equal((await redeem(packs[0])).remaining, 9);
      assert.equal((await status()).redeemedProductIds.length, 1);
    });
    await t.test('only 10 different packs can be redeemed, including simultaneous requests', async () => {
      const results = await Promise.allSettled(packs.slice(1).map(redeem));
      assert.equal(results.filter(result => result.status === 'fulfilled').length, 9);
      assert.equal((await status()).remaining, 0);
      assert.equal((await status()).redeemedProductIds.length, 10);
    });
    await t.test('purchased packs do not require or consume allowance', async () => {
      await db.query("INSERT INTO printable_orders VALUES ($1, 'completed', 'product', $2, null)", [user, packs[11]]);
      assert.equal((await redeem(packs[11])).remaining, 0);
      assert.equal((await status()).redeemedProductIds.length, 10);
    });
    await t.test('ineligible and unconfigured products cannot consume allowance', async () => {
      await db.query('UPDATE printable_products SET is_premium_included=false WHERE id=$1', [packs[11]]);
      await assert.rejects(redeem(packs[11]), /not eligible/);
      const empty = (await db.query('INSERT INTO printable_products DEFAULT VALUES RETURNING id')).rows[0].id;
      await assert.rejects(redeem(empty), /no configured files/);
    });
    await t.test('new anniversary has a fresh allowance; expiry revokes access', async () => {
      await db.exec("UPDATE game_premium_subscriptions SET starts_at=starts_at-interval '2 days'");
      assert.equal((await status()).remaining, 10);
      await db.exec("UPDATE game_premium_subscriptions SET expires_at=now()-interval '1 second'");
      assert.equal((await status()).active, false);
      await assert.rejects(redeem(packs[0]), /active subscription/);
    });
    await t.test('SQL period agrees with UTC month-end behavior', async () => {
      const result = (await db.query("SELECT * FROM game_premium_period('2026-01-31T10:20:30Z','2027-01-31T10:20:30Z','2026-02-28T10:20:30Z')")).rows[0];
      assert.equal(new Date(result.period_start).toISOString(), '2026-02-28T10:20:30.000Z');
      assert.equal(new Date(result.resets_at).toISOString(), '2026-03-31T10:20:30.000Z');
    });
    await t.test('visitors cannot grant themselves membership or write credits', async () => {
      await db.exec('SET ROLE authenticated');
      await assert.rejects(db.exec("UPDATE game_premium_subscriptions SET expires_at=now()+interval '10 years'"), /permission denied/);
      await assert.rejects(db.exec('DELETE FROM game_premium_redemptions'), /permission denied/);
      await db.exec('RESET ROLE');
    });
    await t.test('new daily assignments reject Premium levels', async () => {
      await db.exec("INSERT INTO levels(id,is_premium) VALUES ('00000000-0000-4000-8000-000000000010',true)");
      await assert.rejects(db.exec("INSERT INTO daily_challenges(level_id) VALUES ('00000000-0000-4000-8000-000000000010')"), /free levels/);
    });
    await t.test('interest recording deduplicates and rate-limits independently of visitor id', async () => {
      const record = async (request, visitor=user) => db.query("SELECT record_game_premium_interest($1,$2,'monthly','test',null,null,'network-hash') AS id", [visitor,request]);
      const first = '00000000-0000-4000-8000-000000000100';
      assert.deepEqual((await record(first)).rows, (await record(first)).rows);
      for (let i=101;i<120;i++) await record(`00000000-0000-4000-8000-000000000${i}`);
      await assert.rejects(record('00000000-0000-4000-8000-000000000120','00000000-0000-4000-8000-000000000002'), /Too many requests/);
    });
  } finally { await db.close(); }
});


test('Premium level endpoint enforces authorization, publication and valid content', async t => {
  const { premiumLevelContentResponse } = await loadTypeScript('../lib/premium/levelContentResponse.ts');
  const level = { slug: 'requested-slug', published: true, is_premium: true, mode: 'compare', differences: [{}] };
  const content = { slug: 'requested-slug', image_url_1: 'https://example.com/a.jpg', image_url_2: 'https://example.com/b.jpg', differences: [{ x: 20, y: 30, radius: 5 }] };
  const calls = [];
  const base = {
    getUser: async () => ({ id: 'member' }),
    isActive: async () => true,
    getLevel: async slug => { calls.push(slug); return level; },
    getContent: async id => { calls.push(id); return { ...content, secret: 'must not leak' }; },
  };
  const check = async (deps, status) => {
    calls.length = 0;
    const response = await premiumLevelContentResponse('requested-slug', { ...base, ...deps });
    assert.equal(response.status, status);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    return response.json();
  };
  await t.test('anonymous and inactive/expired memberships cannot query content', async () => {
    await check({ getUser: async () => null }, 401);
    assert.deepEqual(calls, []);
    await check({ isActive: async () => false }, 403);
    assert.deepEqual(calls, []);
  });
  await t.test('missing, unpublished and free levels never query real content', async () => {
    for (const value of [null, { ...level, published: false }, { ...level, is_premium: false }]) {
      await check({ getLevel: async () => value }, 404);
      assert.deepEqual(calls, []);
    }
  });
  await t.test('only requested content fields are returned to members', async () => {
    assert.deepEqual(await check({}, 200), content);
    assert.deepEqual(calls, ['requested-slug', 'requested-slug']);
  });
  await t.test('missing or invalid content never falls back to public coordinates', async () => {
    for (const value of [null,
      { ...content, slug: 'another-level' },
      { ...content, image_url_1: 'javascript:alert(1)' },
      { ...content, image_url_2: null },
      { ...content, differences: [] },
      { ...content, differences: [{ x: 101, y: 30, radius: 5 }] },
      { ...content, differences: [{ x: 20, y: -1, radius: 5 }] },
      { ...content, differences: [{ x: 20, y: 30, radius: 0 }] },
      { ...content, differences: [{ x: '20', y: 30, radius: 5 }] },
    ]) {
      const body = await check({ getContent: async () => value }, 503);
      assert.deepEqual(Object.keys(body), ['error']);
    }
    await check({ getLevel: async () => ({ ...level, mode: 'single' }), getContent: async () => ({ ...content, image_url_2: null }) }, 200);
  });
  await t.test('service errors do not leak database details', async () => {
    for (const method of ['getUser', 'isActive', 'getLevel', 'getContent']) {
      const body = await check({ [method]: async () => { throw new Error('secret database detail'); } }, 503);
      assert.equal(JSON.stringify(body).includes('secret'), false);
    }
  });
});


test('UUID content upgrades to slugs, preserves assets and follows slug changes', async () => {
  const { PGlite } = await import(process.env.PGLITE_MODULE || '@electric-sql/pglite');
  const db = new PGlite();
  try {
    await db.exec(`
      CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      CREATE TABLE public.levels(id uuid PRIMARY KEY, slug text UNIQUE NOT NULL);
      INSERT INTO levels VALUES ('00000000-0000-4000-8000-000000000001', 'stable-puzzle');
      CREATE TABLE public.premium_level_content (
        level_id uuid PRIMARY KEY REFERENCES levels(id) ON DELETE CASCADE,
        image_url_1 text NOT NULL, image_url_2 text, differences jsonb NOT NULL
      );
      INSERT INTO premium_level_content VALUES (
        '00000000-0000-4000-8000-000000000001', 'https://example.com/real.jpg', null,
        '[{"x":20,"y":30,"radius":5}]'
      );
    `);
    const migration = readFileSync(new URL('../supabase/premium_level_content_schema.sql', import.meta.url), 'utf8');
    await db.exec(migration);
    await db.exec(migration);
    const row = (await db.query('SELECT * FROM premium_level_content')).rows[0];
    assert.deepEqual(row, { slug: 'stable-puzzle', image_url_1: 'https://example.com/real.jpg', image_url_2: null, differences: [{ x: 20, y: 30, radius: 5 }] });
    await db.exec("UPDATE levels SET id='00000000-0000-4000-8000-000000000002'");
    assert.deepEqual((await db.query('SELECT * FROM premium_level_content')).rows[0], row);
    await db.exec("UPDATE levels SET slug='renamed-puzzle'");
    assert.equal((await db.query('SELECT slug FROM premium_level_content')).rows[0].slug, 'renamed-puzzle');
    await assert.rejects(db.exec("INSERT INTO premium_level_content(slug, image_url_1, image_url_2, differences) VALUES ('unknown-puzzle', 'https://example.com/x', null, '[]')"), /foreign key/);
    await db.exec("DELETE FROM levels WHERE slug='renamed-puzzle'");
    assert.equal((await db.query('SELECT * FROM premium_level_content')).rows.length, 0);
  } finally { await db.close(); }
});
