import { Metadata } from 'next';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms and conditions for using Spot the Difference games and services.',
  openGraph: {
    title: 'Terms of Service - Spot the Difference',
    description: 'Read the terms and conditions for using our games and services.',
    url: `${siteUrl}/terms`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Terms of Service - Spot the Difference',
    description: 'Read the terms and conditions for using our games and services.',
  },
  alternates: {
    canonical: `${siteUrl}/terms`,
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: November 23, 2025</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to Spot the Difference ("Service," "we," "our," or "us"). These Terms of Service ("Terms") constitute a legally binding agreement between you and Spot the Difference governing your access to and use of our website, games, and related services.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Eligibility</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You must be at least 13 years of age to use the Service. By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>You are at least 13 years old</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will comply with these Terms and all applicable laws and regulations</li>
              <li>All information you provide is accurate, current, and complete</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you are between 13 and 18 years of age, you confirm that you have obtained permission from your parent or legal guardian to use the Service, and that they have reviewed and agreed to these Terms on your behalf.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Account Registration and Security</h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.1 Account Creation</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security and confidentiality of your password</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.2 Account Responsibility</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You are solely responsible for all activities that occur under your account. You agree not to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Share your account credentials with any third party</li>
              <li>Use another user's account without permission</li>
              <li>Create multiple accounts for deceptive purposes</li>
              <li>Impersonate any person or entity</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3.3 Account Termination</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may delete your account at any time through your account settings. Upon deletion, your personal data will be removed in accordance with our Privacy Policy. We reserve the right to retain certain information for legal compliance or legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Use the Service in any way that violates any applicable law or regulation</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Use any automated system (bots, scripts) to access, scrape, or manipulate the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Transmit viruses, malware, or any other harmful code</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload or transmit offensive, inappropriate, or illegal content</li>
              <li>Engage in any form of cheating or exploit game mechanics unfairly</li>
              <li>Attempt to reverse engineer, decompile, or extract source code</li>
              <li>Use the Service for any commercial purpose without our prior written consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Intellectual Property Rights</h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.1 Ownership</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All content, features, and functionality of the Service, including but not limited to text, graphics, logos, images, game designs, software code, and the compilation thereof (collectively, "Content"), are the exclusive property of Spot the Difference or its licensors and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.2 License to Use</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service for your personal, non-commercial entertainment purposes.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.3 Restrictions</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may not:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Copy, modify, distribute, sell, or lease any part of the Service</li>
              <li>Use the Content for any commercial purpose</li>
              <li>Remove any copyright, trademark, or other proprietary notices</li>
              <li>Create derivative works based on the Service or Content</li>
              <li>Frame or mirror any part of the Service without our prior written consent</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.4 User-Generated Content</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By submitting content to the Service (such as profile information, usernames, or feedback), you grant us a worldwide, non-exclusive, royalty-free, perpetual license to use, reproduce, modify, and display such content in connection with operating and promoting the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Game Rules and Fair Play</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To maintain fairness and integrity of the gaming experience:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Cheating, exploiting bugs, or using unauthorized tools is strictly prohibited</li>
              <li>Leaderboard rankings must be achieved through legitimate gameplay</li>
              <li>We reserve the right to remove scores or achievements obtained through unfair means</li>
              <li>Repeated violations may result in account suspension or termination</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Third-Party Content and Links</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Service may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be liable for any damage or loss caused by your use of any third-party content or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Service Modifications and Availability</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Modify, suspend, or discontinue any aspect of the Service at any time</li>
              <li>Impose limits on certain features or restrict access to parts of the Service</li>
              <li>Update or change game content, rules, or features</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We will make reasonable efforts to notify users of significant changes, but we are not obligated to do so. We shall not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 uppercase font-semibold">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To the fullest extent permitted by law, we disclaim all warranties, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Implied warranties of merchantability and fitness for a particular purpose</li>
              <li>Warranties regarding accuracy, reliability, or availability of the Service</li>
              <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
              <li>Warranties regarding the quality of any products, services, or information obtained through the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 uppercase font-semibold">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SPOT THE DIFFERENCE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This limitation applies regardless of the legal theory (contract, tort, strict liability, or otherwise) and whether or not we have been informed of the possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Indemnification</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree to indemnify, defend, and hold harmless Spot the Difference and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Your access to or use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights, including intellectual property rights</li>
              <li>Any content you submit or transmit through the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Termination</h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12.1 Termination by You</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may terminate your account at any time by deleting your account through the account settings page. Upon termination, your right to use the Service will immediately cease.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12.2 Termination by Us</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to suspend or terminate your account and access to the Service, without prior notice or liability, for any reason, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Violation of these Terms</li>
              <li>Fraudulent, abusive, or illegal activity</li>
              <li>Extended periods of inactivity</li>
              <li>At our sole discretion for any other reason</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12.3 Effect of Termination</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Upon termination, all licenses and rights granted to you under these Terms will immediately cease. Sections of these Terms that by their nature should survive termination shall survive, including but not limited to intellectual property provisions, disclaimers, and limitations of liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Dispute Resolution</h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13.1 Governing Law</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the People's Republic of China, without regard to its conflict of law provisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13.2 Arbitration</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Any dispute, controversy, or claim arising out of or relating to these Terms, or the breach, termination, or invalidity thereof, shall be settled by arbitration in accordance with the arbitration rules of the People's Republic of China. The arbitration shall be conducted in Chinese, and the arbitral award shall be final and binding upon both parties.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13.3 Exceptions</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Notwithstanding the above, we may seek injunctive or other equitable relief in any court of competent jurisdiction to protect our intellectual property rights or confidential information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. General Provisions</h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.1 Entire Agreement</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the use of the Service and supersede all prior agreements and understandings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.2 Severability</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300 mb-3">14.3 Waiver</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">14.4 Assignment</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">15. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to modify these Terms at any time. When we make material changes, we will:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Update the "Last Updated" date at the top of this page</li>
              <li>Post a notice on our Service</li>
              <li>Notify registered users via email or in-app notification</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service and delete your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">16. Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-white font-semibold mb-2">Spot the Difference</p>
              <p className="text-gray-700 dark:text-gray-300 mb-1">Email: <a href="mailto:support@spotdiffs.com" className="text-purple-600 hover:underline">support@spotdiffs.com</a></p>
              <p className="text-gray-700 dark:text-gray-300">We aim to respond to all inquiries within 48 hours.</p>
            </div>
          </section>

          <section className="mb-8">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By using Spot the Difference, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
