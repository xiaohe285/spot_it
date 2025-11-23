import { Metadata } from 'next';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Spot the Difference collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy - Spot the Difference',
    description: 'Learn how we collect, use, and protect your personal information.',
    url: `${siteUrl}/privacy`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Privacy Policy - Spot the Difference',
    description: 'Learn how we collect, use, and protect your personal information.',
  },
  alternates: {
    canonical: `${siteUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: November 23, 2025</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Welcome to Spot the Difference ("we," "our," or "us"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (collectively, the "Service").
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing or using the Service, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you register for an account, we may collect the following personal information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Email address (required for account creation)</li>
              <li>Username and display name</li>
              <li>Profile picture or avatar (optional)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.2 Game Activity Data</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you play games on our Service, we automatically collect:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Game scores and completion times</li>
              <li>Accuracy statistics and performance metrics</li>
              <li>Game play history and progress</li>
              <li>Achievements and badges earned</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.3 Automatically Collected Information</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you access our Service, we may automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>IP address and general location information</li>
              <li>Browser type and version</li>
              <li>Device information (type, operating system)</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Account Management:</strong> To create and maintain your user account</li>
              <li><strong>Game Functionality:</strong> To provide game features, track progress, and maintain leaderboards</li>
              <li><strong>Service Improvement:</strong> To understand how users interact with our Service and improve user experience</li>
              <li><strong>Communication:</strong> To send you service-related notifications and respond to your inquiries</li>
              <li><strong>Analytics:</strong> To analyze usage patterns and generate aggregate statistics</li>
              <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Third-Party Services</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use third-party service providers to help us operate and improve our Service:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Analytics Services</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use analytics services to understand how users interact with our Service. These services may collect information about your visit, including pages viewed, time spent, and navigation patterns. This information is used in aggregate form and does not personally identify you.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.2 Advertising (Future)</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may work with advertising partners in the future to display advertisements on our Service. If implemented, we will update this Privacy Policy and notify users accordingly. Any advertising will comply with applicable privacy regulations.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.3 Image Services</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use third-party image hosting services to deliver game images. These services may collect limited technical information necessary to deliver images to your device.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
              <li><strong>Public Information:</strong> Leaderboard rankings, usernames, and game scores are displayed publicly as part of the Service</li>
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our Service (bound by confidentiality agreements)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights, safety, or property</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Secure data storage with industry-standard providers</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Access:</strong> You can access and review your personal information through your account settings</li>
              <li><strong>Correction:</strong> You can update or correct your profile information at any time</li>
              <li><strong>Deletion:</strong> You can request deletion of your account and associated data</li>
              <li><strong>Data Portability:</strong> You can request a copy of your data in a structured format</li>
              <li><strong>Opt-Out:</strong> You can opt out of non-essential communications</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To exercise these rights, please contact us at support@spotdiffs.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us immediately at support@spotdiffs.com, and we will take steps to delete such information.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Users between the ages of 13 and 18 should review this Privacy Policy with a parent or guardian to ensure understanding.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Data Retention</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We retain your personal information for as long as necessary to provide the Service and fulfill the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by law. When you delete your account, we will delete or anonymize your personal information within a reasonable timeframe, except where we are required to retain it for legal or legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. International Data Transfers</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our Service is operated from and governed by the laws of the People's Republic of China. If you are accessing the Service from outside China, please be aware that your information may be transferred to, stored, and processed in China. By using the Service, you consent to the transfer of your information to China and acknowledge that Chinese data protection laws may differ from those in your jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use cookies and similar tracking technologies to enhance your experience on our Service. Cookies are small text files stored on your device that help us:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Remember your login status and preferences</li>
              <li>Analyze how you use our Service</li>
              <li>Improve Service functionality and user experience</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can control cookie settings through your browser. However, disabling cookies may limit your ability to use certain features of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. When we make material changes, we will notify you by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Updating the "Last Updated" date at the top of this policy</li>
              <li>Posting a notice on our Service</li>
              <li>Sending you an email notification (if you have an account)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your continued use of the Service after any changes constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-white font-semibold mb-2">Spot the Difference</p>
              <p className="text-gray-700 dark:text-gray-300 mb-1">Email: <a href="mailto:support@spotdiffs.com" className="text-purple-600 hover:underline">support@spotdiffs.com</a></p>
              <p className="text-gray-700 dark:text-gray-300">We aim to respond to all inquiries within 48 hours.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This Privacy Policy is governed by and construed in accordance with the laws of the People's Republic of China. Any disputes arising from or relating to this Privacy Policy shall be resolved through arbitration in accordance with Chinese law.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
