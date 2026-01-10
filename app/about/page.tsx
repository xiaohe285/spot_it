import { Metadata } from 'next';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Spot the Difference - our mission to provide engaging brain training games with daily updates and premium puzzle experiences.',
  openGraph: {
    title: 'About Us - Spot the Difference',
    description: 'Discover our mission to make cognitive training fun and accessible through daily spot-the-difference puzzles.',
    url: `${siteUrl}/about`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About Us - Spot the Difference',
    description: 'Learn about our mission to provide engaging brain training games with daily updates.',
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About Us</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Discover who we are and what drives us</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Story</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Spot the Difference was born from a simple observation: while cognitive training is essential for maintaining mental sharpness, many brain-training platforms are either too clinical or simply not engaging enough. We set out to change that by creating a platform that combines the timeless appeal of spot-the-difference puzzles with modern web technology and game design principles.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our journey began with a passion for visual puzzles and a commitment to making quality brain training accessible to everyone. What started as a small collection of handcrafted puzzles has grown into a comprehensive platform featuring hundreds of carefully designed challenges, each crafted to provide both entertainment and cognitive benefits.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our mission is to make cognitive training enjoyable, accessible, and rewarding for people of all ages and skill levels. We believe that brain training shouldn't feel like work—it should be a fun, engaging activity that you look forward to every day.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We're committed to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Providing high-quality, engaging spot-the-difference puzzles that challenge your observation skills</li>
              <li>Creating a welcoming community where puzzle enthusiasts can compete, share achievements, and track their progress</li>
              <li>Maintaining a completely free core experience that's accessible to everyone</li>
              <li>Continuously innovating with new game modes, difficulty levels, and features</li>
              <li>Ensuring every puzzle is carefully crafted for the perfect balance of challenge and enjoyment</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Vision</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We envision becoming the world's leading platform for visual puzzle games—a destination where millions of players can improve their cognitive abilities while having fun. We're building more than just a game site; we're creating a global community of puzzle enthusiasts who challenge themselves daily and celebrate their mental fitness achievements.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Looking ahead, we see a future where Spot the Difference offers personalized puzzle experiences, adaptive difficulty systems, and social features that bring puzzle lovers together across continents. We're committed to staying at the forefront of cognitive gaming while preserving the simple joy of discovering differences in beautiful imagery.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fresh Content Every Day</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We understand that variety is key to keeping your mind engaged. That's why we add <strong>new games daily</strong> to our collection. Every day brings fresh challenges across different difficulty levels and themes—whether you're a casual player looking for a quick brain break or a puzzle master seeking the ultimate challenge.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our content update schedule includes:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Daily Challenge:</strong> A specially curated puzzle every 24 hours</li>
              <li><strong>Weekly Themed Collections:</strong> New puzzle series organized by themes and categories</li>
              <li><strong>Seasonal Events:</strong> Special holiday-themed puzzles and limited-time challenges</li>
              <li><strong>Community Favorites:</strong> Popular puzzles refreshed with new variations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Makes Us Different</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Unlike other puzzle platforms, we focus exclusively on delivering the best spot-the-difference experience possible. Our games feature:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Precision-Crafted Puzzles:</strong> Each difference is carefully placed for optimal challenge and fairness</li>
              <li><strong>Progressive Difficulty:</strong> From Easy to Expert levels that grow with your skills</li>
              <li><strong>Performance Tracking:</strong> Detailed statistics, badges, and achievements to monitor your improvement</li>
              <li><strong>Responsive Design:</strong> Seamless gameplay across desktop, tablet, and mobile devices</li>
              <li><strong>Dark Mode Support:</strong> Comfortable viewing experience in any lighting condition</li>
              <li><strong>No Paywalls:</strong> Core gameplay completely free with optional enhancements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Coming Soon</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We're constantly evolving and have exciting features in development:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Multiplayer Challenges:</strong> Compete head-to-head with friends and players worldwide in real-time</li>
              <li><strong>Custom Puzzle Creator:</strong> Upload your own images and create custom spot-the-difference games</li>
              <li><strong>Advanced Statistics:</strong> Deeper insights into your cognitive performance and improvement trends</li>
              <li><strong>Tournament System:</strong> Weekly and monthly competitions with leaderboards and prizes</li>
              <li><strong>Social Features:</strong> Friend lists, private challenges, and achievement sharing</li>
              <li><strong>Mobile Apps:</strong> Native iOS and Android applications for on-the-go puzzle solving</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Join Our Community</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Whether you're here to sharpen your observation skills, compete on the leaderboards, or simply enjoy a few minutes of relaxing puzzle-solving, we're glad you're part of our community. Every player, from casual enthusiasts to competitive champions, helps make Spot the Difference a vibrant and welcoming space for visual puzzle lovers.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Thank you for choosing Spot the Difference as your cognitive training destination. We're excited to be part of your daily routine and mental fitness journey.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Have questions, suggestions, or feedback? We'd love to hear from you:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-white font-semibold mb-2">Spot the Difference</p>
              <p className="text-gray-700 dark:text-gray-300 mb-1">Email: <a href="mailto:support@spotdiffs.com" className="text-purple-600 hover:underline">support@spotdiffs.com</a></p>
              <p className="text-gray-700 dark:text-gray-300">We aim to respond to all inquiries within 48 hours.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
