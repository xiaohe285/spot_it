import { Metadata } from 'next';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Arrow Escape - Free Online Puzzle Game',
  description: 'Play Arrow Escape game online. Navigate through challenging puzzles and escape using your arrow keys. Free to play, no download required.',
  openGraph: {
    title: 'Arrow Escape - Free Online Puzzle Game',
    description: 'Play Arrow Escape game online. Navigate through challenging puzzles and escape using your arrow keys.',
    url: `${siteUrl}/arrow-escape`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arrow Escape - Free Online Puzzle Game',
    description: 'Play Arrow Escape game online. Navigate through challenging puzzles and escape using your arrow keys.',
  },
  alternates: {
    canonical: `${siteUrl}/arrow-escape`,
  },
};

export default function ArrowEscapePage() {
  return (
    <div id="top" className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Arrow Escape
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Navigate through challenging puzzles and escape!
          </p>
        </div>

        {/* Game Container */}
        <div className="mb-12">
          <div className="relative w-full max-w-[960px] mx-auto bg-black rounded-lg overflow-hidden shadow-2xl" style={{ height: '540px' }}>
            <iframe
              src="https://gamep.trendinggames.io/arrowgo/"
              className="w-full h-full border-0"
              allowFullScreen
              title="Arrow Escape Game"
              loading="lazy"
            />
          </div>
        </div>

        {/* How to Play Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              How to Play
            </h2>

            <div className="space-y-6">
              {/* Game Objective */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Game Objective
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Arrow Escape is a thrilling puzzle game where you need to navigate through challenging levels using strategic movements. Your goal is to find the escape route while avoiding obstacles and solving puzzles along the way.
                </p>
              </section>

              {/* Controls */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Controls
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
                        ↑
                      </div>
                      <span className="text-gray-900 dark:text-white font-semibold">Up Arrow</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Move up</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
                        ↓
                      </div>
                      <span className="text-gray-900 dark:text-white font-semibold">Down Arrow</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Move down</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
                        ←
                      </div>
                      <span className="text-gray-900 dark:text-white font-semibold">Left Arrow</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Move left</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center text-white font-bold">
                        →
                      </div>
                      <span className="text-gray-900 dark:text-white font-semibold">Right Arrow</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Move right</p>
                  </div>
                </div>
              </section>

              {/* Game Features */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Game Features
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold text-lg">•</span>
                    <span><strong className="text-gray-900 dark:text-white">Challenging Puzzles:</strong> Multiple levels with increasing difficulty to test your problem-solving skills</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold text-lg">•</span>
                    <span><strong className="text-gray-900 dark:text-white">Strategic Gameplay:</strong> Plan your moves carefully to navigate through obstacles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold text-lg">•</span>
                    <span><strong className="text-gray-900 dark:text-white">Smooth Controls:</strong> Responsive arrow key controls for precise movement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-500 font-bold text-lg">•</span>
                    <span><strong className="text-gray-900 dark:text-white">Progressive Difficulty:</strong> Start easy and work your way up to more complex challenges</span>
                  </li>
                </ul>
              </section>

              {/* Tips and Strategies */}
              <section>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Tips and Strategies
                </h3>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg border border-purple-200 dark:border-purple-700">
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">1.</span>
                      <span><strong>Plan Ahead:</strong> Look at the entire level before making your first move</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">2.</span>
                      <span><strong>Take Your Time:</strong> There's no time limit, so think through each move carefully</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">3.</span>
                      <span><strong>Learn from Mistakes:</strong> If you get stuck, try a different approach</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">4.</span>
                      <span><strong>Practice Makes Perfect:</strong> The more you play, the better you'll understand the game mechanics</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Call to Action */}
              <section className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-700">
                <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-300 mb-3">
                  Ready to Escape?
                </h3>
                <p className="text-orange-700 dark:text-orange-400 mb-4">
                  Start playing now and challenge yourself with this exciting puzzle game. Can you escape all the levels?
                </p>
                <a
                  href="#top"
                  className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Back to Game
                </a>
              </section>
            </div>
          </div>
        </div>

        {/* More Games Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Looking for more games?
          </p>
          <a
            href="/games"
            className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
          >
            Browse All Games
          </a>
        </div>
      </div>
    </div>
  );
}
