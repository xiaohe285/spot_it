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

## Protected Premium game content

Apply `supabase/premium_level_content_schema.sql` after the Premium migration.
It is repeatable and does not copy or modify public level data. Content is keyed
by `slug`, referencing `levels.slug`; UUIDs can change during data migration.
Import `levels` before importing protected content and preserve slugs. Slug
changes cascade to protected content, and deleting a level deletes its content.
If the earlier `level_id` table already exists, running the same migration
converts it to slugs using the existing levels and preserves its real content.
Deploy the updated API together with this schema change; old UUID-based code
cannot read the new table. The new
`premium_level_content` table is readable/writable only by the server's
`service_role`, even for signed-in members. No public catalog view joins it.
`SUPABASE_SERVICE_ROLE_KEY` must be configured on the server.

`GET /api/premium/levels/[slug]` validates the Supabase session and active
membership on every request, then verifies that the level is published and
Premium. It returns only `slug`, `image_url_1`, `image_url_2`, and
`differences`, with `Cache-Control: private, no-store` on success and errors.
Anonymous requests receive 401, inactive memberships 403, and missing,
unpublished or free levels 404. Missing/invalid real content and service errors
receive 503, never public placeholder coordinates. Images must use absolute
HTTP(S) URLs. Compare mode requires both images; single mode allows a null
second image. Coordinates must be finite numbers between 0 and 100, with a
positive radius and a nonempty differences array matching the public count.

The shared game canvas loads the protected content only after membership
resolution; this also covers daily pages that use the canvas. The playable
canvas and its timer mount only after a successful load. Errors offer Retry.
Real content stays in component memory. Logout, account/level changes and
membership invalidation unmount the game, clear header actions and discard
pending responses. Public lists, metadata, filters and structured data continue
to use `levels` exclusively.

### Preparing content

For a new Premium level, create it unpublished. As a database administrator,
insert its real content (replace the sample values):

```sql
insert into public.premium_level_content
  (slug, image_url_1, image_url_2, differences)
values (
  'replace-with-level-slug',
  'https://img.spotdiffs.com/real-original.jpg',
  'https://img.spotdiffs.com/real-modified.jpg',
  '[{"x":25,"y":40,"radius":5},{"x":70,"y":65,"radius":4}]'::jsonb
)
on conflict (slug) do update set
  image_url_1 = excluded.image_url_1,
  image_url_2 = excluded.image_url_2,
  differences = excluded.differences;
```

Set `levels.image_url_1` and `levels.image_url_2` to the same public preview
URL. Store fixed unusable coordinates in `levels.differences`, with exactly the
same array length as the real differences. For example, a two-difference
puzzle can use `[{"x":0,"y":0,"radius":0},{"x":0,"y":0,"radius":0}]`.
Zero-radius placeholders cannot register hits under the current game logic;
they are never used for Premium gameplay. Then set `is_premium = true` and
publish the level. Preserve its other fields, including mode and slug.

For an existing level whose public fields still contain real content, copy
those fields into the protected table **before** replacing them with previews
and placeholders. Do not copy fields that already contain decoys. Prepare both
changes in one administrator transaction when replacing live content. To update
the number of differences later, update both arrays in the same transaction.

Rollout: create the table → prepare protected content for all existing Premium
levels → deploy the endpoint and loader → replace public fields. New Premium
levels must have protected content ready before publication. Missing content
intentionally blocks play, so prepare existing Premium rows before deployment.
Do not remove the protected table while this loader is deployed; rolling back
the app alone does not restore play from public decoy data.

This protects content discovery, not the public image URLs themselves. Members
can still share URLs and previously public assets remain accessible. No billing,
private storage, signed URLs, image proxy or automatic catalog rewriting is
included in this change.
