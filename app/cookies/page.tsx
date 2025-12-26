import { Metadata } from 'next';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how we use cookies and similar technologies to improve your experience on Spot the Difference.',
  openGraph: {
    title: 'Cookie Policy - Spot the Difference',
    description: 'Learn about how we use cookies and similar technologies to improve your experience.',
    url: `${siteUrl}/cookies`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Cookie Policy - Spot the Difference',
    description: 'Learn about how we use cookies and similar technologies to improve your experience.',
  },
  alternates: {
    canonical: `${siteUrl}/cookies`,
  },
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Cookie Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: December 13, 2024</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. What Are Cookies</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our service.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This Cookie Policy explains what cookies are, how we use them on Spot the Difference (&quot;Service,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), how third parties may use cookies on our Service, and how you can manage your cookie preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Types of Cookies We Use</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.1 Essential Cookies</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These cookies are necessary for the basic functionality of our Service. They enable core features such as:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>User authentication and account management</li>
              <li>Game progress and score saving</li>
              <li>Security features and fraud prevention</li>
              <li>Website navigation and accessibility</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These cookies cannot be disabled without affecting the functionality of our Service.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.2 Performance and Analytics Cookies</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use these cookies to understand how visitors interact with our website:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Google Analytics:</strong> Helps us analyze website traffic and user behavior</li>
              <li><strong>Microsoft Clarity:</strong> Records user interactions to improve user experience</li>
              <li>Performance monitoring to identify and fix technical issues</li>
              <li>A/B testing to optimize game features and website design</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.3 Preference Cookies</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These cookies remember your choices and preferences:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Language and region settings</li>
              <li>Theme preferences (light/dark mode)</li>
              <li>Game difficulty settings</li>
              <li>Sound and notification preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2.4 Third-Party Cookies</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Some cookies are set by third-party services we use:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Authentication providers (Google, GitHub):</strong> For secure login</li>
              <li><strong>Content Delivery Networks (CDNs):</strong> For faster content delivery</li>
              <li><strong>Social media platforms:</strong> For sharing functionality</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Cookies</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>To provide and maintain our Service</li>
              <li>To authenticate users and manage user sessions</li>
              <li>To remember your game progress and preferences</li>
              <li>To analyze website usage and improve our Service</li>
              <li>To prevent fraud and enhance security</li>
              <li>To personalize your gaming experience</li>
              <li>To provide customer support</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Third-Party Analytics and Tracking</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.1 Google Analytics</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use Google Analytics to understand how our website is used. Google Analytics may collect information such as:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Pages visited and time spent on pages</li>
              <li>How you arrived at our website</li>
              <li>Your approximate geographic location</li>
              <li>Device and browser information</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You can opt-out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on available at: 
              <a href="https://tools.google.com/dlpage/gaoptout" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
                https://tools.google.com/dlpage/gaoptout
              </a>
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4.2 Microsoft Clarity</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use Microsoft Clarity to understand how users interact with our website through features like session replays and heatmaps. This helps us identify usability issues and improve the user experience.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For more information about Microsoft Clarity&apos;s privacy practices, visit: 
              <a href="https://privacy.microsoft.com/privacystatement" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">
                https://privacy.microsoft.com/privacystatement
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Managing Your Cookie Preferences</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.1 Browser Settings</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>View cookies that have been set on your device</li>
              <li>Block all cookies or specific types of cookies</li>
              <li>Delete existing cookies</li>
              <li>Set your browser to notify you when cookies are being set</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.2 Browser-Specific Instructions</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For detailed instructions on managing cookies in specific browsers:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data</li>
              <li><strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
              <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions &gt; Cookies and site data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5.3 Mobile Devices</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              On mobile devices, you can manage cookies through your browser app settings or by using privacy settings in your device&apos;s system preferences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Impact of Disabling Cookies</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Please note that disabling certain cookies may impact your experience on our Service:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Essential cookies:</strong> Disabling these may prevent core functionality from working properly</li>
              <li><strong>Preference cookies:</strong> You may need to reset your preferences each time you visit</li>
              <li><strong>Analytics cookies:</strong> This won&apos;t affect your gaming experience but may limit our ability to improve the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Cookie Retention</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Cookies have different lifespans depending on their purpose:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Remain on your device for a set period (typically 1-2 years)</li>
              <li><strong>Authentication cookies:</strong> Usually expire after 30 days of inactivity</li>
              <li><strong>Preference cookies:</strong> Typically retained for 1 year</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Updates to This Cookie Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, regulatory, or operational reasons. When we make material changes, we will:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Update the &quot;Last Updated&quot; date at the top of this page</li>
              <li>Post a notice on our Service</li>
              <li>Notify you via email if you have an account with us</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about this Cookie Policy or our use of cookies, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-white font-semibold mb-2">Spot the Difference</p>
              <p className="text-gray-700 dark:text-gray-300 mb-1">Email: <a href="mailto:privacy@spotdiffs.com" className="text-purple-600 hover:underline">privacy@spotdiffs.com</a></p>
              <p className="text-gray-700 dark:text-gray-300">Subject: Cookie Policy Inquiry</p>
            </div>
          </section>

          <section className="mb-8">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By continuing to use our Service, you acknowledge that you have read and understood this Cookie Policy and consent to our use of cookies as described herein.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}