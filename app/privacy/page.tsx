import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { LegalSection } from '@/components/layout/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How SpotDiffs handles account, gameplay, subscription, payment, analytics, and support information and how to exercise your privacy rights.',
  alternates: { canonical: 'https://spotdiffs.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <LegalSection id="controller" title="1. Who this policy covers">
        <p>This policy explains how <strong>Qin JUNKUN</strong>, the individual operator of SpotDiffs based in Guangdong, People’s Republic of China (“we,” “us,” or “our”), handles personal information at <a href="https://spotdiffs.com">spotdiffs.com</a>, including online puzzles, Premium membership, and printable products. Qin JUNKUN is the data controller responsible for this processing. Privacy requests are handled directly by the operator through the monitored mailbox <a href="mailto:support@spotdiffs.com?subject=Privacy%20request">support@spotdiffs.com</a>.</p>
        <p>This policy describes our practices; it does not make consent a condition for processing that relies on a different lawful basis. Our <Link href="/terms">Terms of Service</Link> explain the membership contract, billing, cancellation, and refunds.</p>
      </LegalSection>

      <LegalSection id="collection" title="2. Information we collect">
        <ul>
          <li><strong>Account information:</strong> email address, account identifier, username, display name, and available profile picture. Supabase manages authentication credentials and sessions. For Google sign-in, we receive the identity and profile information authorized through Google; we do not receive your Google password.</li>
          <li><strong>Gameplay:</strong> levels played, scores, completion times, progress, accuracy, achievements, badges, and streaks. Some progress is stored in your browser; signed-in activity may be saved to your account.</li>
          <li><strong>Membership and purchases:</strong> chosen plan, checkout and order references, payment identifiers, payment status, amounts and currency when supplied by the provider, transaction dates, paid membership periods, renewal/cancellation status, and printable redemptions and download access records.</li>
          <li><strong>Support:</strong> your email address, correspondence, account or order references, and information you choose to send us. Please do not send passwords, full card numbers, or card security codes.</li>
          <li><strong>Technical and usage information:</strong> IP address, approximate region inferred from network information, browser and device characteristics, referring pages, page visits, feature interactions, request timestamps, and diagnostic or security logs. We do not request precise device geolocation.</li>
          <li><strong>Browser storage:</strong> sign-in sessions, preferences, locally saved game progress, and download receipts or access tokens. Clearing this storage may remove progress or download access saved only on that device.</li>
        </ul>
        <p><strong>Payment-card details:</strong> Waffo Pancake processes Premium subscription payments through its hosted checkout and payment partners. Card information is entered with the provider; SpotDiffs does not store full card numbers or security codes on its servers. Separately purchased printable products use PayPal, which processes those payment credentials under its own policy. We receive the limited transaction information needed to verify purchases and provide access.</p>
      </LegalSection>

      <LegalSection id="purposes" title="3. Purposes and legal bases">
        <p>Where GDPR or similar laws apply, we use the following legal bases:</p>
        <ul>
          <li><strong>Performing our contract:</strong> creating accounts, providing games and saved progress, verifying purchases, managing subscriptions, issuing download access, processing cancellations or refunds, and responding to requests about the purchased service.</li>
          <li><strong>Legitimate interests:</strong> securing accounts, preventing fraud and abuse, investigating errors, handling support, and sending necessary operational notices. We assess these interests against your rights. Non-essential analytics rely on consent where the law requires it.</li>
          <li><strong>Legal obligations:</strong> retaining legally required accounting records, responding to valid legal requests, and meeting applicable tax, payment, and consumer-protection requirements.</li>
          <li><strong>Consent:</strong> optional communications and non-essential tracking where required. You may withdraw consent without changing the lawfulness of earlier processing.</li>
        </ul>
        <p>We do not use personal information to make solely automated decisions that produce legal or similarly significant effects. Security checks and game-score validation may be automated.</p>
      </LegalSection>

      <LegalSection id="cookies" title="4. Cookies, local storage, and analytics">
        <p>Necessary cookies and session storage support sign-in, security, and payment-related access. Functional local storage remembers preferences, progress, and printable access receipts. Non-essential analytics help us understand visits and interactions. Necessary storage may be required for a requested feature; optional storage can be controlled using browser settings, though blocking all storage can affect sign-in and downloads.</p>
        <ul>
          <li><strong>Google Analytics:</strong> when configured, records page visits and feature events, such as a Premium plan selection or checkout click, with technical and usage information. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s Privacy Policy</a> and the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics opt-out add-on</a>.</li>
          <li><strong>Microsoft Clarity:</strong> collects website interaction information, such as clicks, scrolling, and session replay data, to help diagnose usability problems. These records can relate to a browser or device and are not necessarily anonymous. See the <a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank" rel="noopener noreferrer">Microsoft Privacy Statement</a>.</li>
        </ul>
        <p>You can remove cookies and site data, block tracking through browser controls or extensions, and contact us about tracking-related rights. We do not currently provide an on-site cookie preference center. See our <Link href="/cookies">Cookie Policy</Link> for additional storage information.</p>
      </LegalSection>

      <LegalSection id="sharing" title="5. Who receives information">
        <p>We do not sell or rent your personal information. We disclose information only for operating the Service, the purposes described here, your directions, or legal requirements:</p>
        <ul>
          <li><strong>Waffo Pancake and its payment partners:</strong> receive account identifiers, billing email, chosen product, checkout references, and purchase metadata needed for Premium checkout, recurring billing, fraud prevention, and payment support. Card data is handled by the payment provider, not stored by SpotDiffs. See <a href="https://waffo.com/en/privacy-policy" target="_blank" rel="noopener noreferrer">Waffo’s Privacy Policy</a>.</li>
          <li><strong>PayPal:</strong> handles separate printable purchases and supplies transaction confirmations. See <a href="https://www.paypal.com/legalhub/privacy-full" target="_blank" rel="noopener noreferrer">PayPal’s Privacy Statement</a>.</li>
          <li><strong>Supabase:</strong> provides authentication and database services for account, gameplay, membership, and purchase records. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase’s Privacy Policy</a>.</li>
          <li><strong>Hosting, file delivery, and technical providers:</strong> process network and request data to serve pages, images, and PDF files, including Cloudflare storage and delivery services. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">Cloudflare’s Privacy Policy</a>.</li>
          <li><strong>Analytics providers:</strong> Google Analytics and Microsoft Clarity receive the information described in Section 4 under their applicable terms and privacy policies.</li>
          <li><strong>Other players:</strong> display names, scores, and rankings may appear in public leaderboard features. Your account email and payment information are not intentionally published there.</li>
          <li><strong>Authorities and advisers:</strong> where needed to comply with law, protect safety and rights, resolve a dispute, or investigate fraud.</li>
          <li><strong>Business successors:</strong> if the Service is transferred, subject to applicable safeguards and notice of material changes in how your information is handled.</li>
        </ul>
        <p>Payment providers may also process information for their own legal, tax, fraud-prevention, or regulatory obligations. Third-party websites and sign-in services have their own policies.</p>
      </LegalSection>

      <LegalSection id="security" title="6. Security and incident response">
        <p>We use HTTPS for production connections, provider-managed authentication, access controls for account records, and server-side payment verification. Administrative database credentials and payment signing keys are kept on the server. No transmission or storage system can be guaranteed completely secure; protect your credentials and report suspected compromise to support.</p>
        <p>If a personal data breach occurs, we will assess its effects and give notices required by applicable law. Where GDPR requires notification to a supervisory authority, the applicable deadline is without undue delay and, where feasible, within 72 hours of becoming aware of the breach. Affected individuals will be informed without undue delay where legally required.</p>
      </LegalSection>

      <LegalSection id="retention" title="7. Data retention and account closure">
        <p>We retain account information and saved activity while your account remains open to provide the Service. Canceling Premium renewal does not delete your free account or immediately erase membership or purchase records.</p>
        <p>Our standard retention schedule is:</p>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[600px] text-left text-sm">
            <caption className="sr-only">Personal information retention periods and disposal</caption>
            <thead className="bg-slate-100 dark:bg-slate-800"><tr><th scope="col" className="p-4">Information</th><th scope="col" className="p-4">Retention period</th><th scope="col" className="p-4">After the period</th></tr></thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr><th scope="row" className="p-4 font-semibold">Account, profile, and account-linked gameplay</th><td className="p-4">While the account is open; delete or anonymize from active systems within 30 days after a verified account-deletion request, and from routine backups within 90 days.</td><td className="p-4">Delete or irreversibly anonymize, except separately retained records below.</td></tr>
              <tr><th scope="row" className="p-4 font-semibold">Order, payment, subscription, redemption, and refund records</th><td className="p-4">7 years after the end of the calendar year in which the transaction or subscription ends, whichever is later.</td><td className="p-4">Delete or anonymize; keep only legally required accounting records in restricted archives if a longer statutory period applies.</td></tr>
              <tr><th scope="row" className="p-4 font-semibold">Customer-support correspondence</th><td className="p-4">2 years after the inquiry is resolved.</td><td className="p-4">Securely delete or anonymize; transaction evidence follows the transaction schedule.</td></tr>
              <tr><th scope="row" className="p-4 font-semibold">Security and network audit logs</th><td className="p-4">6 months from collection.</td><td className="p-4">Delete or anonymize, unless needed for a documented incident or a legal preservation requirement.</td></tr>
            </tbody>
          </table>
        </div>
        <p>To request account deletion, email <a href="mailto:support@spotdiffs.com?subject=Account%20deletion%20request">support@spotdiffs.com</a> from your registered address. We will verify the request and explain any records that must be retained. Deletion is completed in active systems within 30 days and in routine backups under our control within 90 days of the verified request; backup data is restricted to recovery and is not returned to active use without reapplying deletion requests. Retained transaction records are restricted to accounting, tax, fraud-prevention, and dispute purposes; they are not used to keep a deleted gameplay profile active.</p>
        <p>A legal hold, unresolved claim, or mandatory accounting or tax rule may require specific records to be kept longer. For example, records classified as accounting vouchers may require a 30-year statutory archive period under applicable Chinese accounting rules. We retain only what is necessary, restrict access, and delete or anonymize the records when the applicable requirement ends.</p>
        <p>Browser-only data remains on your device until it expires or is removed through the site, browser settings, or clearing local storage. Payment and analytics providers may retain information under their own policies and legal obligations.</p>
      </LegalSection>

      <LegalSection id="rights" title="8. Your privacy rights">
        <p>Depending on where you live and the applicable law, you may request access to or a copy of your information, correction, deletion, restriction of processing, a portable copy, or information about its collection and disclosure. You may object to processing based on legitimate interests, object to direct marketing, and withdraw consent for processing based on consent. California residents may have additional rights to know, correct, delete, and opt out of sale or sharing as defined by applicable law, and to exercise rights without unlawful discrimination.</p>
        <p>Email <a href="mailto:support@spotdiffs.com?subject=Privacy%20rights%20request">support@spotdiffs.com</a> with the subject “Privacy rights request” and describe the request. We may need proportionate identity verification to protect your account. We aim to respond within 30 calendar days; where a different statutory deadline or permitted extension applies, we will explain it. You may authorize an agent where permitted by law.</p>
        <p>You may complain to your local data protection regulator. In the EEA, this may be the authority in your habitual residence, workplace, or place of the alleged infringement; in the UK, it is the Information Commissioner’s Office. This does not limit other available remedies.</p>
      </LegalSection>

      <LegalSection id="communications" title="9. Communications and choices">
        <p>Account verification, payment, cancellation, security, and policy notices are service communications. Any optional marketing messages must have a lawful basis, including consent where required. To stop optional promotional emails, use the unsubscribe option included in the message or email support. Opting out does not prevent necessary service or legal notices.</p>
      </LegalSection>

      <LegalSection id="transfers" title="10. International processing">
        <p>SpotDiffs is operated from China, and our cloud, authentication, analytics, and payment providers may process information in other countries. Protections may differ from those in your country. Where applicable law requires safeguards for an international transfer, we use an appropriate lawful transfer mechanism, such as an adequacy decision or standard contractual clauses with necessary supplementary measures. Contact support for information about safeguards applicable to your data.</p>
      </LegalSection>

      <LegalSection id="children" title="11. Children and younger users">
        <p>Accounts are not intended for children under 13 or a higher minimum age required by local law. Users under 18 should review this policy with a parent or guardian. Purchases must be made by an adult. A puzzle category labeled “Kids” describes the difficulty or theme and does not invite children below the minimum age to create accounts.</p>
        <p>We do not knowingly collect account information from children below the applicable age. If you believe a child has provided personal information, contact <a href="mailto:support@spotdiffs.com">support@spotdiffs.com</a> so we can investigate and delete it as appropriate.</p>
      </LegalSection>

      <LegalSection id="external-services" title="12. External services">
        <p>Links, third-party authentication, hosted payment pages, and provider services may be governed by their own privacy notices. This policy covers our processing and does not replace those notices. Review the applicable provider’s notice before giving information directly to it.</p>
      </LegalSection>

      <LegalSection id="changes" title="13. Policy updates">
        <p>We will update the version and date on this page when our practices change. Material changes will be announced by a prominent website notice or registered email at least 15 days in advance, except where an earlier update is necessary to comply with law or address a security issue. We will seek fresh consent when legally required; continued use does not substitute for consent where consent is required.</p>
      </LegalSection>

      <LegalSection id="contact" title="14. Contact us">
        <p><strong>Data controller and operator:</strong> Qin JUNKUN, individual operator, Guangdong, People’s Republic of China.</p>
        <p>For privacy requests, account deletion, support, billing, or security issues, email <a href="mailto:support@spotdiffs.com">support@spotdiffs.com</a>. Using “Privacy request” or “Security report” in the subject helps us route your message. We aim to acknowledge general inquiries within two business days; privacy rights requests follow Section 8.</p>
      </LegalSection>
    </LegalPage>
  );
}
