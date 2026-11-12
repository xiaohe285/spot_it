import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { LegalSection } from '@/components/layout/LegalPage';
import { premiumPlans } from '@/lib/premium/plans';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SpotDiffs terms for puzzle games, Premium subscriptions, recurring billing, cancellation, refunds, and printable downloads.',
  alternates: { canonical: 'https://spotdiffs.com/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <LegalSection id="acceptance" title="1. About these terms">
        <p>These Terms govern your use of SpotDiffs at <a href="https://spotdiffs.com">spotdiffs.com</a>, including our online puzzles, Premium membership, and printable digital products (the “Service”). SpotDiffs is operated by <strong>Qin JUNKUN</strong>, an individual operator based in Guangdong, People’s Republic of China. In these Terms, “we,” “us,” and “our” refer to Qin JUNKUN trading as SpotDiffs.</p>
        <p>By using the Service or purchasing a subscription, you agree to these Terms. Please also read our <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use the Service or complete a purchase.</p>
      </LegalSection>

      <LegalSection id="service" title="2. Service and eligibility">
        <p>SpotDiffs provides spot-the-difference puzzles for entertainment and downloadable PDF activity packs. Products are digital; we do not ship physical goods. Free games remain available without a Premium subscription. Some puzzle illustrations may be created with AI assistance; we do not provide a user-facing AI generation service.</p>
        <p>You must be at least 13, or the higher minimum age required where you live, to create an account. Users under 18 need a parent or guardian’s permission and supervision. You must be at least 18 and legally authorized to use the payment method to purchase a subscription; a parent or guardian must make purchases for a minor.</p>
      </LegalSection>

      <LegalSection id="account" title="3. Accounts and security">
        <p>Keep your registration details and billing email accurate, protect your login credentials, and do not share, sell, or transfer your account. Report unauthorized access to <a href="mailto:support@spotdiffs.com">support@spotdiffs.com</a>. Accounts may use email/password or supported Google sign-in.</p>
        <p>You can request account deletion by emailing support from your registered address. Cancel any active renewal first or ask us to cancel it as part of your request. Signing out, clearing browser data, or stopping play does not cancel recurring billing. Subscription cancellation and account deletion are separate actions.</p>
      </LegalSection>

      <LegalSection id="plans" title="4. Premium subscription plans">
        <p>Premium includes access to Premium online puzzles, ad-free browsing, and an allowance of 10 eligible printable packs per subscription month. Current plans are available on the <Link href="/premium">Premium page</Link>:</p>
        <ul>{premiumPlans.map(plan => <li key={plan.id}><strong>{plan.name}:</strong> USD {(plan.priceCents / 100).toFixed(2)} charged every {plan.months === 1 ? 'month' : plan.months === 3 ? '3 months' : '12 months'}.</li>)}</ul>
        <p>Quarterly and annual prices are charged in full at the start of each billing period. A displayed monthly equivalent is for comparison and does not mean monthly installments. The selected plan, recurring interval, currency, total, and applicable taxes are shown before you confirm payment. No free trial is currently offered.</p>
        <p>The printable allowance refreshes on your monthly membership anniversary, including on quarterly and annual plans. For a shorter calendar month, the anniversary falls on its last day. Unused allowances do not roll over, cannot be transferred or redeemed for cash, and are not separately purchased credits. One eligible product counts as one pack, even when it has multiple files; downloading its files again during the same subscription month does not consume another pack. Membership download access requires an active membership and a redemption in the current subscription month.</p>
        <p>Separately purchased printable PDFs and printable passes are different products with their own displayed access terms. They do not create or renew a Waffo Premium subscription.</p>
      </LegalSection>

      <LegalSection id="billing" title="5. Recurring billing and payment authorization">
        <p><strong>By choosing a paid plan and confirming checkout, you authorize recurring charges to your selected payment method for that plan at its stated interval until you cancel renewal.</strong> The initial charge is due at purchase; subsequent charges occur when the paid billing period renews.</p>
        <p>Premium payments are processed through <strong>Waffo Pancake</strong> using its hosted checkout and payment partners. Full card numbers and card security codes are handled by the payment provider and are not stored on SpotDiffs servers. Access begins after payment has been verified; returning from checkout alone does not confirm payment.</p>
        <p>Prices are in US dollars. Applicable VAT, GST, sales tax, or other taxes, if any, are shown at checkout before payment. Your bank may apply currency conversion or other fees. Keep the payment receipt and use <Link href="/my-orders">My Orders</Link> to view available Premium payment records.</p>
        <p>If a renewal payment fails, membership may expire at the end of the previously paid period. A failed or pending payment does not extend access. Contact support about payment problems before creating a second subscription.</p>
        <p>If we change a recurring price or materially reduce a paid plan’s benefits, we will notify affected subscribers by email or a prominent website notice at least 30 days before the change takes effect. Price changes apply to a future renewal, and you may cancel beforehand. Additional consent will be obtained where required by law.</p>
      </LegalSection>

      <LegalSection id="cancellation" title="6. Canceling renewal">
        <p><strong>You can cancel automatic renewal at any time online:</strong> sign in to the account used to subscribe, open <Link href="/premium">Premium</Link>, scroll to your active membership details, and select <strong>Cancel renewal</strong>. A successful request displays a “Renewal canceled” confirmation. If an error appears or your status is unclear, contact support so we can verify it.</p>
        <p>You may also request cancellation by emailing <a href="mailto:support@spotdiffs.com">support@spotdiffs.com</a> from your registered address with the subject “Cancel Premium renewal.” Include the account email and available order reference, never full payment-card details. Allow time for a support-assisted request to be processed before your next billing date; the online option is available without waiting for a support response.</p>
        <p>Cancel before the next renewal charge to stop future billing. Your membership and monthly printable allowance remain available until the end of your already paid period, shown in your membership details. Cancellation does not itself refund an earlier charge, delete your account, or remove separately purchased printable access. Data handling is explained in our <Link href="/privacy#retention">Privacy Policy</Link>.</p>
      </LegalSection>

      <LegalSection id="refunds" title="7. Refund policy for Premium subscriptions">
        <p><strong>First-purchase 7-day money-back guarantee:</strong> if this is your first Premium purchase, you may request a full refund within 7 calendar days of your first successful payment. This guarantee applies to monthly, quarterly, and annual plans, even if you have played Premium puzzles or redeemed printable packs. It is available once per customer and does not restart on renewal or a later purchase.</p>
        <p>Outside this guarantee and the exceptions below, fees for a used billing period are generally non-refundable simply because you stop using the Service. Canceling renewal prevents future charges and preserves access through the paid period; it does not itself request a refund.</p>
        <ul>
          <li><strong>Duplicate charges and billing errors:</strong> we will refund a verified duplicate charge in full and refund any amount incorrectly charged, including a renewal charged after an effective cancellation.</li>
          <li><strong>Extended service outage:</strong> if a verified failure attributable to us makes the paid Service unavailable for more than 72 consecutive hours, you may request a prorated refund for the affected paid time or agree with us to an equivalent membership extension. The refund is calculated using the fee paid for the affected billing period and the proportion of that period for which the paid Service was unavailable. This compensation does not limit the first-purchase guarantee or your statutory rights.</li>
          <li><strong>Service not delivered:</strong> contact us if paid access is not activated or a material service defect prevents use. If we cannot provide the purchased service or remedy the problem, we will provide an appropriate refund or other remedy required by law.</li>
          <li><strong>Consumer rights:</strong> nothing in these Terms removes statutory withdrawal, cancellation, refund, or other consumer rights, including applicable EU/UK rights. Any exception for immediately supplied digital services applies only when its legal requirements, including any required express consent and acknowledgment, have been met.</li>
        </ul>
        <p>Request a refund at <a href="mailto:support@spotdiffs.com?subject=Premium%20refund%20request">support@spotdiffs.com</a> with your account email, transaction or order ID, charge date, and reason. For the 7-day guarantee, send the request within the 7-day window; processing time does not affect eligibility. Do not send passwords, full card numbers, or security codes. We aim to acknowledge requests within two business days and initiate approved refunds to the original payment method within 5–10 business days of approval. Your bank or payment provider may need additional time to post the credit.</p>
        <p>A full subscription refund ends the refunded Premium access and cancels its future renewal. A partial outage refund does not cancel renewal unless you ask us to do so. Refund processing is handled through support and the payment provider.</p>
        <p>Separately purchased PayPal printable products are covered by the <Link href="/refund-policy">Digital Delivery &amp; Refund Policy</Link>. That policy does not replace this Premium subscription policy.</p>
      </LegalSection>

      <LegalSection id="billing-disputes" title="8. Billing questions and disputes">
        <p>For an unfamiliar charge, failed cancellation, or receipt question, email <a href="mailto:support@spotdiffs.com">support@spotdiffs.com</a> with your order reference. We aim to respond within two business days and investigate promptly. Contacting us does not restrict your right to contact your bank or payment provider, dispute a payment, or use a remedy available under applicable law.</p>
      </LegalSection>

      <LegalSection id="license" title="9. Content and permitted use">
        <p>Our games, illustrations, designs, software, and printable materials belong to SpotDiffs or their respective licensors. You receive a limited, non-exclusive, non-transferable license for personal, non-commercial play. A printable may be printed for one household or one classroom. Downloaded files remain subject to this license after membership ends.</p>
        <p>You may not resell, sublicense, redistribute, publicly upload, or commercially republish our PDFs or game content. Feedback and profile information may be used as needed to provide the Service; personal data remains subject to the Privacy Policy.</p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="10. Acceptable use and fair play">
        <ul>
          <li>Do not violate laws, intellectual property rights, privacy rights, or child-protection rules.</li>
          <li>Do not share paid access, bypass paywalls or download controls, misuse payment methods, or impersonate another person.</li>
          <li>Do not attack the Service, introduce malware, access another account, or interfere with security features.</li>
          <li>Do not use automated scraping, cheating tools, fraudulent scores, or exploits to manipulate games, rankings, or printable allowances.</li>
          <li>Do not use profile information or communications to harass, defraud, or harm others.</li>
        </ul>
        <p>We may remove fraudulent scores and restrict abusive access proportionately to protect the Service.</p>
      </LegalSection>

      <LegalSection id="privacy" title="11. Privacy and third-party services">
        <p>Our <Link href="/privacy">Privacy Policy</Link> describes account, gameplay, payment, analytics, and support data, their purposes, and your rights. Canceling renewal does not delete a free account. Waffo Pancake processes Premium payments; PayPal processes separately purchased printable products. Third-party sites and providers have their own terms and privacy practices.</p>
      </LegalSection>

      <LegalSection id="liability" title="12. Availability and liability">
        <p>We work to keep the Service available, but maintenance, network issues, and provider outages may interrupt access. Games are for recreation, and no particular learning or health outcome is promised. Except for express commitments in these Terms and rights required by law, the Service is provided as available.</p>
        <p>To the extent permitted by law, we are not responsible for indirect or consequential losses, and our aggregate liability is limited to the fees you paid us during the 12 months before the event giving rise to a claim. These limits do not exclude liability for fraud, intentional misconduct, death or personal injury caused by negligence, or any liability or consumer remedy that cannot legally be limited.</p>
      </LegalSection>

      <LegalSection id="termination" title="13. Suspension and termination">
        <p>We may suspend or terminate access for a material breach, fraud, a security threat, or a legal requirement. Where reasonably possible, we will explain the issue and allow an opportunity to resolve it. If we discontinue a prepaid service for reasons other than your breach, we will refund the unused portion of the prepaid period. Termination does not remove mandatory refund rights.</p>
        <p>You can request account closure through support. Obligations that necessarily continue after closure, including content restrictions, payment obligations already incurred, and applicable dispute provisions, survive termination.</p>
      </LegalSection>

      <LegalSection id="law" title="14. Governing law and consumer rights">
        <p>These Terms are governed by the laws of the People’s Republic of China, subject to any mandatory protections and rights to bring claims in your place of residence. Please contact support to try to resolve a dispute informally. Nothing requires you to waive access to a competent court, a consumer authority, or any statutory dispute-resolution process.</p>
      </LegalSection>

      <LegalSection id="changes" title="15. Changes to these terms">
        <p>We will announce material changes at least 15 days before they take effect through a prominent website notice or your registered email, unless an earlier change is necessary for legal or security reasons. Recurring price changes follow Section 5. Changes do not retroactively remove accrued rights. Where consent is required, we will request it. If a provision is unenforceable, the remaining provisions continue to apply.</p>
      </LegalSection>

      <LegalSection id="contact" title="16. Contact and support">
        <p><strong>Operator:</strong> Qin JUNKUN, individual operator, Guangdong, People’s Republic of China.</p>
        <p>For general support, billing, cancellations, refund requests, privacy, or security reports, email <a href="mailto:support@spotdiffs.com">support@spotdiffs.com</a>. Include a clear subject and your account or order reference where relevant. We aim to respond within two business days. Online renewal cancellation is available on <Link href="/premium">Premium</Link>.</p>
      </LegalSection>
    </LegalPage>
  );
}
