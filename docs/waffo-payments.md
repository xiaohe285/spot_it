# Waffo Premium payments (test)

`/premium` now uses `@waffo/pancake-ts` for recurring game membership:
Monthly USD 9.00, Quarterly USD 24.00, Annual USD 90.00. The printable-only
PayPal store remains a separate product. The API derives account ownership from
the verified Supabase session. Card details are entered only on Waffo's hosted
checkout. Private keys and checkout session tokens never enter client bundles.

## Complete local setup

1. Apply `supabase/waffo_premium_schema.sql` in the Supabase SQL editor, after
   `supabase/game_premium_schema.sql`. This migration has not been applied remotely.
   Use a dedicated test Supabase project to keep test transactions separate.
2. Merchant and store IDs have been added to the ignored `.env.local`:
   `MER_43OKW9eWvpvqc1s4Y8txgV` / `STO_7ZGXX1WgWMBtNFT51lNdkn`.
   Set `WAFFO_PRIVATE_KEY` to your actual **test** RSA PEM key (escaped `\n`
   supported), or set `WAFFO_PRIVATE_KEY_BASE64`. A real test key has been
   configured in the ignored local environment file. Keep secrets in local/deployment environment configuration, not in chat
   or Git. Configure the existing Supabase variables and service role key too.
3. Run `npm run waffo:setup`. It creates three test subscription products in the
   specified store, saves each returned ID to `.env.local`, and reuses configured
   IDs on later runs. Fixed idempotency keys protect retried product creation.
   Alternatively copy existing matching test product IDs into
   `WAFFO_PRODUCT_MONTHLY`, `WAFFO_PRODUCT_QUARTERLY`, `WAFFO_PRODUCT_ANNUAL`.
4. Start `npm run dev`. For webhook delivery, run `ngrok http 3000` and set
   `WAFFO_SITE_URL` to the resulting public HTTPS origin. Run `npm run waffo:setup`
   again to register `/api/waffo/webhook` in test mode; it saves `WAFFO_WEBHOOK_ID`
   for later updates. Restart Next.js after environment changes.
5. Sign in at `/premium`, select a plan, and subscribe. The test-mode notice is
   visible. Use Waffo's success card `4576750000000110`, a future expiry and any
   CVC; decline card: `4576750000000220`. Confirm membership activates through
   webhook processing. Returning to `/premium?checkout=returned` alone grants
   nothing; the page polls membership for up to a minute and supports Retry.
6. Cancel renewal using the active membership's button. Confirm the
   `subscription.canceling` event keeps access until paid expiry and
   `subscription.canceled` terminates access. Test renewal and replay via Waffo's
   test tools and inspect the server-only `waffo_premium_events` table.

The setup command stops with an actionable error until a real key is configured.
Three test products have now been created and their IDs saved locally. Short-lived
anonymous and authenticated checkout sessions were also created successfully
without submitting a payment. The remote Supabase migration remains unapplied;
the available service-role API key cannot execute schema migrations.
The test webhook has been registered using the ngrok HTTPS origin saved in
`WAFFO_SITE_URL`; its registration ID is saved in `WAFFO_WEBHOOK_ID`. Keep the
ngrok tunnel running. If its URL changes, update `WAFFO_SITE_URL` and rerun setup.

## Routes and event processing

- `POST /api/waffo/checkout`: same-origin and login required; accepts only a plan
  ID. Price, currency, product, account ID and return URL are server controlled.
  Creates an authenticated Waffo session and redirects in the same browser tab.
  One pending checkout per user is reused for 30 minutes, including across tabs.
  A pending different plan must expire first; existing active memberships block
  a second subscription. Failed SDK calls leave a retryable reservation.
- `POST /api/waffo/subscription`: cancels only the current user's Waffo order in
  the configured environment; preserves access until the verified paid period ends.
- `POST /api/waffo/webhook`: raw-body SDK RSA verification and replay protection,
  then store/environment scoping and checkout ownership validation. The middleware
  excludes this endpoint from Supabase session refresh. It needs no login cookie.

Lifecycle events: `subscription.activated`, `subscription.renewed`,
`subscription.recovered`, `subscription.canceling`, `subscription.uncanceled`,
`subscription.canceled`, `subscription.past_due`, `subscription.plan_changed`.
`subscription.payment_succeeded` is a charge notification without subscription
periods; it must not extend access. Signed `currentPeriodStart/End` values determine
expiry. Renewal retains the original monthly credit anchor. `past_due` does not
extend the paid expiry, and cancellation requests retain paid access.

Events outside this app, store or environment receive 200 without granting access.
Only server-created checkout IDs can grant membership. A short PostgreSQL
transaction deduplicates by environment, store, event type, business ID and event
timestamp and commits the entitlement update atomically. Some event types reuse
order/delivery IDs, so deduplication cannot use the order ID alone. Stale lifecycle
events do not roll back newer state; delayed activation can restore the original
monthly anniversary. A later subscription is protected from an old order's events.
Invalid signatures receive 401; processing/storage failures receive 503 so Waffo
can retry. The handler acknowledges after this durable commit, rather than losing
payment events to untracked background work after responding.

Test entitlements are filtered out of server membership, protected game content
and PDF access when `WAFFO_ENVIRONMENT=prod`. Keep separate test/production data
and credentials. Going live requires a deliberate rollout: production API key,
published matching products, `WAFFO_ENVIRONMENT=prod`, HTTPS site origin and a
separate production webhook registration. The setup script only creates test
products. Automated plan switching and refund access policies are not exposed.

## Checks

`npm run test:waffo` covers SDK signature/replay checks, event scope, transactional
fulfillment, duplicate/out-of-order notifications, anniversary preservation,
cancellation and database permissions. `npm run test:premium` checks the existing
membership and printable allowance behavior. Run `npx tsc --noEmit`, lint and
`npm run build` before deployment. Real end-to-end checkout still requires valid
test credentials and a public webhook URL.

Official references: [integration skill](https://docs.waffo.ai/zh/integrate/skill),
[SDK](https://docs.waffo.ai/zh/integrate/sdks),
[webhooks](https://docs.waffo.ai/zh/api-reference/webhooks).

## Session and connection troubleshooting

Premium browser requests send the current Supabase access token in the
Authorization header in addition to normal same-origin cookies. The server
verifies it with `getUser(token)` and uses the verified account for payment
ownership. Cookie-only requests continue to work. The membership status query
uses the same token for its user-scoped RPC.

A missing/invalid session returns 401 with `SESSION_EXPIRED`. Authentication
network/service errors return 503 with `AUTH_UNAVAILABLE`; these must not be
presented as a signed-out account. Errors appear directly under the Subscribe
button, with a retry or sign-in action and accessible focus/live announcement.

If a verified checkout reservation exists but checkout still fails, check the
server's connectivity to `api.waffo.ai`. A DNS `ENOTFOUND` error is a machine/network
issue; signing out and back in will not resolve it. Browser connectivity does not
prove the Node.js server can resolve the same hostname.

## Account badge and My Orders

The account menu uses the existing verified Premium status for its gold crown and
Premium badge. Canceling renewal retains the badge until expiry. My Orders is
available to every signed-in account at `/my-orders`, including former members.
Only Premium subscription payments are shown, not the PayPal printable store.

Apply `supabase/waffo_premium_payments_schema.sql` after the existing Waffo
migration **before enabling payment receipt events**. This adds the read-own,
server-write-only `waffo_premium_payments` ledger and the transactional
`record_waffo_premium_payment` RPC. Amounts are exact display-format strings;
unknown actual amounts remain null, never inferred from the current plan price.

After deploying the updated webhook handler, run `npm run waffo:setup` to include
`subscription.payment_succeeded` in the registered TEST webhook. This event
records a charge and binds it to its server-created checkout; it never grants
membership. Subscription activation and renewal continue through the existing
lifecycle handler. Payment IDs deduplicate delivery retries and history imports.

Historical data rollout:

```bash
npm run waffo:backfill          # read-only verification; prints counts only
npm run waffo:backfill -- --apply
```

The backfill reads only checkouts in the configured store/environment with a
known Waffo order ID. It verifies order identity, environment, store, external ID
and buyer identity when supplied; it never matches by email. It imports only
successful payments using `pspAmountDetails.amount` and the order's product
version name. Repeating it is safe; a missing amount can be filled later without
changing an already recorded amount. Both commands require server credentials.
A failed import can be rerun; already persisted payments are deduplicated.

`GET /api/orders?page=1` verifies a cookie or bearer session before querying
records for that user, store and environment. It returns 20 records in descending
payment-date/payment-ID order plus `hasMore`. It exposes only receipt fields,
never checkout URLs, tokens, email, or raw event payloads. Responses are private
and not cached. `/my-orders` is excluded from indexing. Membership lookup errors
are independent of payment-history errors, and identity changes discard stale
responses/data. Run `npm run test:orders` for normalization, storage/RLS,
backfill ownership, pagination, authentication and badge-state coverage.
