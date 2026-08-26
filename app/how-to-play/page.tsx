import { Metadata } from 'next';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'How to Play',
  description: 'Learn how to play Spot the Difference games. Simple rules, tips, and strategies to improve your observation skills.',
  openGraph: {
    title: 'How to Play - Spot the Difference',
    description: 'Learn how to play Spot the Difference games with our simple guide and tips.',
    url: `${siteUrl}/how-to-play`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'How to Play - Spot the Difference',
    description: 'Learn how to play Spot the Difference games with our simple guide and tips.',
  },
  alternates: {
    canonical: `${siteUrl}/how-to-play`,
  },
};

export default function HowToPlayPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How to Play</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">A simple guide to mastering Spot the Difference games</p>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Game Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Spot the Difference is a classic puzzle game that challenges your observation skills. Two seemingly identical images are presented side by side, but they contain subtle differences that you need to find and click on.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The goal is simple: find all the differences between the two images as quickly and accurately as possible to achieve the highest score.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Basic Rules</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Finding Differences</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Carefully compare the two images and look for any differences between them. Differences can include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Missing or extra objects</li>
              <li>Different colors or patterns</li>
              <li>Changed shapes or sizes</li>
              <li>Altered text or numbers</li>
              <li>Modified backgrounds or textures</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Clicking to Mark</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you spot a difference, click on it in either image. A green circle will appear to mark the found difference. You can click on the difference in the left image or the right image - both work the same way.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Wrong Clicks</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you click on an area that doesn't contain a difference, a red "X" will briefly appear. Wrong clicks will reduce your final score, so try to be accurate with your clicks.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Completing the Game</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Find all the differences to complete the level. The number of differences varies by level difficulty - easy levels typically have 3-5 differences, while harder levels may have 8-12.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Scoring System</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your score is calculated based on your performance:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li><strong>Base Score:</strong> 1000 points for completing the level</li>
              <li><strong>Wrong Click Penalty:</strong> -50 points for each incorrect click</li>
              <li><strong>Time Bonus:</strong> Additional points for completing quickly (varies by level)</li>
              <li><strong>Perfect Game:</strong> Extra bonus for finding all differences without any wrong clicks</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Game Features</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Hint System</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you're stuck, you can use the Hint button to highlight the general area of an unfound difference. Each level typically allows 1-3 hints. Use them wisely as they're limited!
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Progress Tracking</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The game shows your progress at the top of the screen, displaying how many differences you've found out of the total number. A progress bar visually represents your completion status.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Timer</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              A timer tracks how long you take to complete each level. Faster completion times contribute to higher scores and better leaderboard rankings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Difficulty Levels</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Easy</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Perfect for beginners and casual players. Features clear, obvious differences with simple images and bright colors.
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>3-5 differences per level</li>
              <li>Large, easy-to-spot changes</li>
              <li>Colorful, simple images</li>
              <li>3 hints available</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Medium</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              A balanced step up from Easy, with moderately subtle changes and richer scenes.
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>4-6 differences per level</li>
              <li>Moderately subtle visual changes</li>
              <li>More detailed scenes</li>
              <li>Up to 3 hints available</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Hard</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For experienced players who enjoy a challenge. Features more subtle differences and complex scenes.
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>5-8 differences per level</li>
              <li>Smaller, more subtle changes</li>
              <li>Detailed, complex images</li>
              <li>2 hints available</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Expert</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The ultimate challenge for master observers. Extremely subtle differences that require keen attention to detail.
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>8-12 differences per level</li>
              <li>Very small, difficult-to-spot changes</li>
              <li>Highly detailed, intricate images</li>
              <li>Only 1 hint available</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tips and Strategies</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Systematic Scanning</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Don't look randomly. Instead, scan the images systematically:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Start from one corner and work your way across</li>
              <li>Compare corresponding sections of both images</li>
              <li>Focus on one small area at a time</li>
              <li>Return to previously checked areas if needed</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Look for Common Difference Types</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Pay attention to shadows and reflections</li>
              <li>Check text, signs, and numbers carefully</li>
              <li>Look for missing or extra small objects</li>
              <li>Notice color variations in clothing or objects</li>
              <li>Watch for changes in facial expressions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Use Visual Techniques</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Cross your eyes slightly to overlay the images mentally</li>
              <li>Look at the images from different angles</li>
              <li>Take breaks if your eyes get tired</li>
              <li>Adjust your screen brightness for better visibility</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Save Hints for Later</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Try to find as many differences as possible before using hints. Save them for the last few differences that are proving particularly elusive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Game Categories</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">For Adults</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Complex scenes with realistic images, detailed artwork, and sophisticated themes designed for mature players.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">For Kids</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Fun, colorful images featuring cartoons, animals, and child-friendly themes with easier-to-spot differences.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Special Themes</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Seasonal collections, holiday themes, and special event puzzles that celebrate different times of the year.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Daily Challenges</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Every day features a special challenge with:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>Double points for completion</li>
              <li>Leaderboard competition with other players</li>
              <li>Special achievements and rewards</li>
              <li>Unique, hand-picked images not available elsewhere</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Check back daily to maintain your streak and climb the global leaderboard!
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Need Help?</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have questions about gameplay or encounter any technical issues, feel free to reach out:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-900 dark:text-white font-semibold mb-2">Contact Support</p>
              <p className="text-gray-700 dark:text-gray-300 mb-1">Email: <a href="mailto:support@spotdiffs.com" className="text-purple-600 hover:underline">support@spotdiffs.com</a></p>
              <p className="text-gray-700 dark:text-gray-300">We typically respond within 24 hours.</p>
            </div>
          </section>

          <section className="mb-8">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700">
              <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-3">Ready to Start Playing?</h3>
              <p className="text-orange-700 dark:text-orange-400 mb-4">
                Now that you know how to play, it's time to put your skills to the test! Choose your difficulty level and start your spot the difference journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href="/games" 
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors text-center"
                >
                  Browse All Games
                </a>
                <a 
                  href="/daily/today" 
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors text-center"
                >
                  Try Today's Challenge
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
