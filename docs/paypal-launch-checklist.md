# PayPal launch and review checklist

The application code follows PayPal's standard checkout flow: the browser shows
the PayPal button, while the server creates the order and captures it through
the Orders v2 API. The server independently looks up the product price and
verifies the product slug, currency, amount, order status, and capture status
before it creates a download token.

Official references:

- Standard checkout integration:
  https://developer.paypal.com/platforms/checkout/standard/integrate
- REST API credentials and sandbox accounts:
  https://developer.paypal.com/api/rest/
- Move an app to production:
  https://developer.paypal.com/reference/production/
- PayPal application policies:
  https://developer.paypal.com/api/rest/reference/policiesandguidelines/

## 1. Configure sandbox

Create or select a Sandbox REST app in PayPal Developer Dashboard, then set the
deployment environment:

```bash
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=<sandbox client id>
PAYPAL_CLIENT_SECRET=<sandbox client secret>
PAYPAL_DOWNLOAD_SECRET=<stable random secret of at least 32 characters>
SUPABASE_SERVICE_ROLE_KEY=<server-only Supabase service role key>
```

Generate the download secret once:

```bash
openssl rand -base64 48
```

Do not expose `PAYPAL_CLIENT_SECRET` or `PAYPAL_DOWNLOAD_SECRET` to the browser.
The client ID is intentionally public and is returned by
`/api/paypal/config` so the PayPal JavaScript SDK can load.

## 2. Run a sandbox purchase

1. Open `/printables/classroom-seasons-bundle`.
2. Confirm the product name, USD price, PDF format, page count, digital-only
   notice, refund-policy link, and PayPal button are visible before checkout.
3. Pay with a PayPal Personal sandbox account.
4. Confirm the page changes to “Payment complete” only after capture.
5. Download the PDF and confirm it opens.
6. Open the paid download route without its token and confirm it returns 403.
7. Repeat once with a declined sandbox payment and confirm no link appears.
8. Buy `/printables/premium`, then confirm every Premium-included product can
   be downloaded while a non-Premium product remains protected.

## 3. Website URLs for PayPal review

The screenshot supplied with the task asks for an accessible website with
product display and an online order/payment flow. Submit the public store URL:

- Store: `https://spotdiffs.com/printables`
- Example paid product:
  `https://spotdiffs.com/printables/classroom-seasons-bundle`
- About: `https://spotdiffs.com/about`
- Contact: `https://spotdiffs.com/contact`
- Privacy: `https://spotdiffs.com/privacy`
- Terms: `https://spotdiffs.com/terms`
- Digital delivery/refunds: `https://spotdiffs.com/refund-policy`

Before submitting, deploy the new version and verify every URL opens without
login. The paid product page must show an active PayPal button, which means live
or sandbox credentials must be configured in that deployed environment.

The site currently identifies the storefront as **SpotDiffs** and uses
`support@spotdiffs.com`. Confirm that the legal business name, business address,
merchant email, and website domain in the PayPal Business account are accurate
and consistent. Those account-specific details are not stored in this
repository and must not be invented.

## 4. Switch to live

PayPal's production guidance requires live credentials and the production API
host. Set:

```bash
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=<live client id>
PAYPAL_CLIENT_SECRET=<live client secret>
PAYPAL_DOWNLOAD_SECRET=<the same stable production download secret>
```

The server selects `https://api-m.paypal.com` when `PAYPAL_MODE=live`. After
deployment:

1. Confirm `/api/paypal/config` reports live mode without logging the client
   secret.
2. Make one small real purchase from a buyer account that is different from the
   merchant account.
3. Verify the order in PayPal Activity and verify the PDF download.
4. Keep the PayPal order ID shown after checkout for support reconciliation.
5. Add any webhook, dispute, tax, or invoicing settings required by the merchant
   account's country and business model.

## 5. Review-ready behavior already implemented

- Public store and individual product pages with clear USD prices.
- A free PDF that downloads without payment.
- Paid files stored outside `public/` and blocked with HTTP 403 without a valid
  signed token.
- Server-side PayPal order creation and capture.
- Server-side validation of product, amount, currency, and completed capture.
- Completed individual and Premium purchases recorded in Supabase.
- One-time Premium purchases grant 31 days of access without auto-renewal.
- Download link shown only after successful capture.
- Product file type, page count, audience, difficulty, and digital-only delivery
  displayed before checkout.
- About, contact, privacy, terms, delivery/refund, and licensing information.
- Support path for lost links using the PayPal order ID.

## 6. Operational follow-up

Apply `supabase/printables_store_schema.sql` before enabling checkout. The
catalog, filters, private file mappings, Premium plan, and completed orders use
those tables. Signed links support anonymous buyers, while purchases are also
bound to the existing authenticated user when one is present.

Before launch, add PayPal webhooks for `PAYMENT.CAPTURE.COMPLETED`,
`PAYMENT.CAPTURE.REFUNDED`, and dispute events so refunded or disputed account
access can be revoked and reconciled.
