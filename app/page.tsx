import Link from "next/link";
import Image from "next/image";
import { getPopularLevels, getFeaturedLevels, getTodaysChallenge } from "@/lib/levels";
import { getGlobalLeaderboard } from "@/lib/gameRecords";

export default async function Home() {
  // Fetch data from database
  const { data: popularGames } = await getPopularLevels(4);
  const { data: featuredGames } = await getFeaturedLevels(4);
  const { data: topPlayers } = await getGlobalLeaderboard(3);
  const { data: todaysChallenge } = await getTodaysChallenge();
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center bg-gradient-to-br from-orange-100 via-pink-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden py-16">
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
            {/* Left: Main Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 dark:text-white mb-6 tracking-tight">
                Challenge Your Eyes, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">Spot the Difference!</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed font-medium">
                Find hidden differences from images, enjoy daily puzzles, and explore fun themed levels for all ages. Start spotting now and challenge your eyes!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/games"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full font-bold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start Playing Now
                </Link>
                <Link
                  href="/games"
                  className="px-8 py-4 bg-green-500 text-white rounded-full font-bold text-lg hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  View All Challenges
                </Link>
              </div>
            </div>

            {/* Right: Daily Challenge Preview */}
            <div className="flex justify-center lg:justify-end">
              {todaysChallenge ? (
                <Link
                  href={`/game/${todaysChallenge.level.slug}?from=home`}
                  className="group relative w-full max-w-md"
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-yellow-400/50 transform transition-all duration-300 group-hover:scale-105 group-hover:border-yellow-400">
                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                      <span className="text-lg">⭐</span>
                      TODAY&apos;S CHALLENGE
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        todaysChallenge.level.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                        todaysChallenge.level.difficulty === 'Medium' ? 'bg-sky-500 text-white' :
                        todaysChallenge.level.difficulty === 'Hard' ? 'bg-orange-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {todaysChallenge.level.difficulty}
                      </span>
                    </div>

                    {/* Preview Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                      <Image
                        src={todaysChallenge.level.image_url_1}
                        alt={todaysChallenge.level.title}
                        fill
                        className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="px-8 py-4 bg-white/95 backdrop-blur-sm text-orange-600 rounded-full font-bold text-lg shadow-xl transform transition-all group-hover:bg-yellow-400 group-hover:scale-110">
                        Start Challenge →
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                      <h3 className="text-white font-bold text-xl mb-1">
                        {todaysChallenge.special_title || todaysChallenge.level.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-yellow-400 font-semibold">
                          ⚡ {todaysChallenge.bonus_multiplier}x Points
                        </span>
                        <span className="text-gray-300">
                          🏆 {todaysChallenge.special_badge || 'Daily Badge'}
                        </span>
                        <span className="text-gray-300">
                          🔍 {todaysChallenge.level.differences.length} Differences
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                /* Fallback when no challenge available */
                <Link
                  href="/games"
                  className="group relative w-full max-w-md"
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-purple-400/50 transform transition-all duration-300 group-hover:scale-105 group-hover:border-purple-400">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="text-center text-white">
                          <div className="text-6xl mb-4">🎯</div>
                          <h3 className="text-2xl font-bold mb-2">Browse Games</h3>
                          <p className="text-purple-100">Thousands of puzzles await!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Games Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Popular Games</h2>
            <p className="text-gray-600 dark:text-gray-400">Most played by our community</p>
          </div>
          <Link href="/games" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularGames && popularGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.slug}?from=home`}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Game Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={game.image_url_1}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Difficulty Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    game.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                    game.difficulty === 'Medium' ? 'bg-sky-500 text-white' :
                    game.difficulty === 'Hard' ? 'bg-orange-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>

                {/* Player Count Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-yellow-400 text-xs">👥</span>
                  <span className="text-white text-xs font-semibold">{game.total_plays?.toLocaleString()}</span>
                </div>
              </div>

              {/* Game Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {game.differences.length} differences
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Games</h2>
            <p className="text-gray-600 dark:text-gray-400">Hand-picked by our editors</p>
          </div>
          <Link href="/games" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGames && featuredGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.slug}?from=home`}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Game Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={game.image_url_1}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Difficulty Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    game.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                    game.difficulty === 'Medium' ? 'bg-sky-500 text-white' :
                    game.difficulty === 'Hard' ? 'bg-orange-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>

                {/* Featured Star Badge */}
                <div className="absolute top-3 left-3">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>

              {/* Game Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {game.differences.length} differences
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Choose Your Challenge</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "For Adults",
              desc: "Complex scenes and subtle differences.",
              color: "from-blue-500 to-cyan-400",
              href: "/games/adults"
            },
            {
              title: "For Kids",
              desc: "Fun, colorful, and easier puzzles.",
              color: "from-orange-500 to-yellow-400",
              href: "/games/kids"
            },
            {
              title: "Special Themes",
              desc: "Seasonal and thematic collections.",
              color: "from-pink-500 to-rose-400",
              href: "/themes"
            }
          ].map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{cat.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{cat.desc}</p>
              <span className="text-purple-600 font-semibold group-hover:translate-x-2 transition-transform inline-block">
                Browse Levels →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Leaderboard Preview - Only show if there are players */}
      {topPlayers && topPlayers.length > 0 && (
        <section className="container mx-auto px-4 bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Players</h2>
              <p className="text-gray-500 dark:text-gray-400">All-time champions</p>
            </div>
            <Link href="/leaderboard" className="text-purple-600 font-semibold hover:text-purple-700">
              View Full Leaderboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPlayers.map((player, index) => (
              <div key={player.user_id || index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-white shrink-0
                  ${player.rank === 1 ? 'bg-yellow-400' : player.rank === 2 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                  #{player.rank}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white truncate">
                    {player.username || 'Anonymous'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {player.score?.toLocaleString() || 0} pts
                  </div>
                </div>
                {/* Avatar: Show image if available, otherwise show first letter */}
                {player.avatar ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <img src={player.avatar} alt={player.username || 'User'} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold shrink-0">
                    {(player.username || 'A')[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
