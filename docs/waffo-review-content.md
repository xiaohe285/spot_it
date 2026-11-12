# Waffo storefront review content — November 12, 2026

References:
- https://docs.waffo.ai/zh/mor/account-reviews/tos#v1-subscription-sections-4-7
- https://docs.waffo.ai/zh/mor/account-reviews/privacy-policy

The English Terms now use subscription sections 4–7 (plans, recurring payment
authorization, online cancellation, refunds). Premium allowances are part of the
subscription, not sold as a credit balance. Separate PayPal purchases retain their
existing delivery/refund policy. The Premium purchase area links the policies and
displays recurring authorization. The shared footer exposes the existing support
email directly without requiring login or opening a policy.

The Privacy Policy describes the implemented Supabase authentication, Google
sign-in, Waffo/PayPal payments, printable redemptions, browser storage, Google
Analytics when configured, Microsoft Clarity, and Cloudflare file delivery.

## Owner-confirmed policy decisions

- Legal operator/data controller: Qin JUNKUN, an individual operator based in
  Guangdong, People's Republic of China. No company registration or unprovided
  street address is asserted.
- Owner confirms support@spotdiffs.com receives mail and is actively monitored.
- First Premium purchase: full refund when requested within 7 calendar days,
  for all plans, without a game-use or printable-redemption restriction. This
  guarantee is available once per customer, not on renewals.
- Verified duplicate charges: full refund. Verified outages attributable to the
  operator lasting over 72 consecutive hours: prorated refund for affected paid
  time or an agreed equivalent membership extension. Renewal can be canceled
  online at any time.
- Support acknowledges refund requests within two business days as a target;
  approved refunds are initiated within 5–10 business days. Bank posting may
  take longer. Full refunds terminate refunded access and future renewal;
  partial outage compensation does not automatically cancel renewal.
- Owner authorized reasonable retention periods: active account/gameplay data
  deleted or anonymized within 30 days after a verified deletion request;
  routine backups within 90 days; transaction/subscription/refund records seven
  years after the end of the calendar year the transaction/subscription ends;
  resolved support correspondence two years; security/network audit logs six
  months. Statutory accounting archives and documented legal holds override
  these defaults only for the necessary records.
- The 7-year transaction period is an operational policy, not a claim that all
  Chinese accounting records have a 7-year statutory period. Certain accounting
  vouchers require 30-year archiving. Routine personal data should not be retained
  for 30 years merely because other records are accounting archives.

Retention references:
- Chinese accounting archive rules (classification and statutory periods):
  https://www.mof.gov.cn/gp/xxgkml/tfs/201512/t20151214_2510365.htm
- Current Cybersecurity Law (network-log retention):
  https://sdca.miit.gov.cn/zwgk/fgbz/art/2026/art_4815dd4ec11d454783b83a91502a3cc7.html

## Operational checks

- Verify the published checkout has the correct merchant identity and policy URLs.
- Confirm annual-renewal reminders with Waffo or implement them; the app currently
  has no reminder-mail workflow. No automatic reminder or cancellation-email
  promise is made in the new Terms.
- Non-essential analytics currently load without a consent preference interface.
  Updating disclosure does not implement consent; assess and configure this for
  the markets served before claiming consent-based tracking is enforced.
- Put retention/deletion procedures in place to meet the published periods,
  including backup deletion, restricted statutory archives, and documented holds.
  This change publishes the policy; it does not implement a cleanup scheduler,
  delete existing records, or initiate provider refunds.
- Verify processor locations and the international-transfer safeguards described
  in the Privacy Policy against the actual provider agreements.
- Test live-mode checkout, cancellation and webhook delivery before accepting
  real payments. This content change does not switch Waffo from test to production.

These edits are local source changes and do not constitute deployment or a Waffo
review submission.
