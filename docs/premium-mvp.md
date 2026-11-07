# Game Premium MVP

Game membership is separate from the existing printable-only pass. No payment
provider is called and no subscription is created by the public Subscribe button.

## Database rollout

Apply `supabase/game_premium_schema.sql` in the Supabase SQL editor after the
existing levels, daily-challenges and printable-store schemas, **before deploying
this code**. The migration is repeatable, preserves installed view columns, and
leaves every existing level free. It has not been applied to a remote database by
this change.

Set `SUPABASE_SERVICE_ROLE_KEY` on the server for intent recording and protected
PDF metadata (it is also used by the existing printable store). Never expose it
with a `NEXT_PUBLIC_` prefix. No new payment secrets are required.

Mark chosen new levels with `levels.is_premium = true`. The migration rejects new
Premium daily-challenge assignments. Keep already scheduled free challenges free.

For a test account, run as the database administrator, replacing the UUID:

```sql
insert into public.game_premium_subscriptions(user_id, plan, starts_at, expires_at)
values ('REPLACE_WITH_AUTH_USER_UUID', 'monthly', now(), now() + interval '1 month');
```

Use `quarterly` / `3 months` or `annual` / `1 year` for other plans. To renew the
same membership, extend `expires_at` and retain `starts_at` so its monthly anchor
and credit history stay consistent. To revoke access, set `expires_at` to a time
after `starts_at` but before now. Ordinary users cannot write these tables.

## PDF credits

The database RPC locks the subscription row before counting or inserting a pack
redemption. One product consumes one credit regardless of its number of files.
The unique key is member + UTC monthly period start + product. Ten distinct packs
are allowed per subscription month. The SQL period function calculates every
anniversary from the original start date, preserving the time and restoring the
original day after short months. Unused credits do not roll over.

POST `/api/premium/printables/[slug]` redeems a pack; GET downloads never redeem.
The download endpoint requires an active membership and a redemption in the
current period, or a valid pre-existing purchase/pass. Downloads can be retried
without another deduction. Existing purchase receipts are checked before using
credits. A new subscription month requires a new redemption for an old pack.

The current membership and pack allowance appear on `/premium`. Eligible
printable detail pages offer the credit action alongside their existing purchase
options. A user must be signed in to redeem or use membership benefits.

## Intent data and analytics

POST `/api/premium/interest` records the selected plan and server-derived USD
price. A request UUID makes retries idempotent. Optional email registration
updates that same record. The endpoint checks same origin and limits new records
to 20 per visitor or HMAC-hashed network identifier per rolling day. Email is only
stored after explicit submission; there is no outgoing email integration.

When the existing GA integration is configured, events include:
`premium_page_view`, `premium_plan_select`, `premium_subscribe_click`,
`premium_notify_submit`, and `premium_locked_view`. Email never enters these
events. Treat clicks and signups as intent, not paid conversions.

```sql
select plan, count(*) as intent_records,
       count(distinct visitor_id) as interested_visitors,
       count(*) filter (where email is not null) as launch_signups
from public.game_premium_interest
group by plan;
```

## Verification

- `npm run test:premium`: isolated PostgreSQL/WASM tests plus pricing and UTC
  anniversary tests; does not connect to Supabase or use production credentials.
- `npx tsc --noEmit` and `npm run build`.
- Browser QA: monthly default, all plan prices, optional email success/retry,
  filter pagination, mobile/dark dialog, locked/free/member gameplay, and no
  AdSense requests for active members. Membership resolution fails closed; retry
  is available. Logging in after AdSense has loaded refreshes the document to
  remove injected auto-ad frames.

Before real billing, add verified provider events, renewal/cancellation handling
and protection for the game data/images, which remain publicly discoverable in
the existing catalog architecture. The MVP gates gameplay, not asset scraping.
