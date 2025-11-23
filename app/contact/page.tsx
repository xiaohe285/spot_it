import { Metadata } from 'next';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Spot the Difference team. We\'re here to help with questions, feedback, and support.',
  openGraph: {
    title: 'Contact Us - Spot the Difference',
    description: 'Get in touch with our team. We\'re here to help with questions, feedback, and support.',
    url: `${siteUrl}/contact`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us - Spot the Difference',
    description: 'Get in touch with our team for questions, feedback, and support.',
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We'd love to hear from you! Whether you have questions, feedback, or need support, we're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Email Contact Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Email Support</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Send us an email and we'll get back to you as soon as possible.
            </p>
            <a
              href="mailto:support@spotdiffs.com"
              className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:underline text-lg"
            >
              support@spotdiffs.com
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <strong>Response Time:</strong> We typically respond within 48 hours
              </p>
            </div>
          </div>

          {/* Social Media Card (Placeholder for Future) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="text-4xl mb-4">🌐</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Social Media</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Follow us on social media for updates, new games, and community events.
            </p>
            <div className="space-y-3">
              <p className="text-gray-500 dark:text-gray-400 italic">
                Coming soon! We're working on launching our social media presence.
              </p>
            </div>
          </div>
        </div>

        {/* What to Include in Your Message */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8 border border-purple-100 dark:border-gray-700 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What to Include in Your Message</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            To help us assist you more efficiently, please include the following information when contacting us:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mr-3">1</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Your Username</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">This helps us locate your account if needed</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mr-3">2</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Detailed Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Describe your issue or question clearly</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mr-3">3</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Device & Browser</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Tell us what device and browser you're using</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold mr-3">4</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Screenshots (if applicable)</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Visual examples help us understand issues faster</p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Common Inquiry Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">🐛</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Bug Reports</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Found a bug or technical issue? Let us know!</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Feature Requests</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Have an idea for a new feature? We'd love to hear it!</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl mb-3">❓</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">General Questions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Questions about how the game works or your account?</p>
            </div>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Before You Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You might find quick answers to common questions:
          </p>
          <div className="space-y-4">
            <details className="group">
              <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 list-none flex items-center justify-between">
                <span>How do I reset my password?</span>
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300 pl-4">
                You can reset your password by clicking on "Forgot Password" on the login page. We'll send you a password reset link to your registered email address.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 list-none flex items-center justify-between">
                <span>How do I delete my account?</span>
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300 pl-4">
                You can delete your account anytime through your account settings. Once deleted, your personal data will be permanently removed from our system.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 list-none flex items-center justify-between">
                <span>Why isn't my score showing on the leaderboard?</span>
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300 pl-4">
                Leaderboards update in real-time, but there may be a brief delay. Make sure you're logged in when playing for your scores to be recorded. If the issue persists, please contact us.
              </p>
            </details>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 list-none flex items-center justify-between">
                <span>Is Spot the Difference free to play?</span>
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 text-gray-600 dark:text-gray-300 pl-4">
                Yes! Spot the Difference is completely free to play. All games and features are available at no cost.
              </p>
            </details>
          </div>
        </div>

        {/* Business Inquiries */}
        <div className="mt-12 text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Business Inquiries</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            For partnership opportunities, advertising, or other business-related matters, please email us at:
          </p>
          <a
            href="mailto:support@spotdiffs.com"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:underline text-lg"
          >
            support@spotdiffs.com
          </a>
        </div>
      </div>
    </div>
  );
}
