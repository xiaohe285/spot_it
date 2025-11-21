import Link from "next/link";
import Image from "next/image";
import { levels } from "@/data/levels";

export default function Home() {
  // Mock data for popular games (based on player count)
  const popularGames = [
    { ...levels[0], players: 15234 }, // Sunny Beach
    { ...levels[2], players: 12456 }, // Cute Animals
    { ...levels[1], players: 11890 }, // City Night
    { ...levels[3], players: 10567 }, // Mountain Peaks
  ];

  // Featured games (editor's picks)
  const featuredGames = [
    levels[4], // Tropical Forest
    levels[6], // Space Adventure
    levels[5], // Underwater World
    levels[7], // Autumn Park
  ];
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900 overflow-hidden py-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
            {/* Left: Main Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                Spot the <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">Difference</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-10 leading-relaxed font-medium drop-shadow-md">
                Challenge your observation skills with thousands of levels.
                Find the hidden differences and climb the leaderboard!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/games"
                  className="px-8 py-4 bg-white text-purple-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
                >
                  Start Playing
                </Link>
                <Link
                  href="/daily/today"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
                >
                  View All Challenges
                </Link>
              </div>
            </div>

            {/* Right: Daily Challenge Preview */}
            <div className="flex justify-center lg:justify-end">
              <Link
                href="/daily/today"
                className="group relative w-full max-w-md"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-yellow-400/50 transform transition-all duration-300 group-hover:scale-105 group-hover:border-yellow-400">
                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    <span className="text-lg">⭐</span>
                    TODAY'S CHALLENGE
                  </div>

                  {/* Preview Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                    <img
                      src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"
                      alt="Today's Challenge"
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="px-8 py-4 bg-white/95 backdrop-blur-sm text-gray-900 rounded-full font-bold text-lg shadow-xl transform transition-all group-hover:bg-yellow-400 group-hover:scale-110">
                      Start Challenge →
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
                    <h3 className="text-white font-bold text-xl mb-1">The Hidden Temple</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-yellow-400 font-semibold">⚡ Double XP</span>
                      <span className="text-gray-300">🏆 Exclusive Badge</span>
                    </div>
                  </div>
                </div>
              </Link>
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
          {popularGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.slug}`}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Game Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={game.imageUrl1}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Difficulty Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    game.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                    game.difficulty === 'Hard' ? 'bg-orange-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>

                {/* Player Count Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-yellow-400 text-xs">👥</span>
                  <span className="text-white text-xs font-semibold">{game.players?.toLocaleString()}</span>
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
          {featuredGames.map((game) => (
            <Link
              key={game.id}
              href={`/game/${game.slug}`}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Game Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={game.imageUrl1}
                  alt={game.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                {/* Difficulty Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    game.difficulty === 'Easy' ? 'bg-green-500 text-white' :
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
              href: "/games/themes"
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

      {/* Leaderboard Preview */}
      <section className="container mx-auto px-4 bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Players</h2>
            <p className="text-gray-500 dark:text-gray-400">This week's champions</p>
          </div>
          <Link href="/leaderboard" className="text-purple-600 font-semibold hover:text-purple-700">
            View Full Leaderboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { rank: 1, name: "EagleEye", score: 15420, avatar: "🦅" },
            { rank: 2, name: "PixelHunter", score: 14200, avatar: "🕵️" },
            { rank: 3, name: "SpotMaster", score: 13850, avatar: "👑" },
          ].map((player) => (
            <div key={player.rank} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-white
                ${player.rank === 1 ? 'bg-yellow-400' : player.rank === 2 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                #{player.rank}
              </div>
              <div className="flex-grow">
                <div className="font-bold text-gray-900 dark:text-white">{player.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{player.score} pts</div>
              </div>
              <div className="text-2xl">{player.avatar}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
