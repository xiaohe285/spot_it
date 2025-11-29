import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getLevelsByDifficulty } from '@/lib/levels';

const MAX_GAMES_PER_DIFFICULTY = 12;
const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Games by Difficulty - Easy, Hard & Expert Puzzles',
  description: 'Browse spot the difference games by difficulty level. Choose from easy, hard, or expert puzzles to match your skill level.',
  openGraph: {
    title: 'Games by Difficulty - Spot the Difference',
    description: 'Browse spot the difference games by difficulty level. Choose from easy, hard, or expert puzzles.',
    url: `${siteUrl}/games/difficulty`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Games by Difficulty - Spot the Difference',
    description: 'Browse spot the difference games by difficulty level.',
  },
  alternates: {
    canonical: `${siteUrl}/games/difficulty`,
  },
};

export default async function DifficultyPage() {
    const difficulties: ('Easy' | 'Hard' | 'Expert')[] = ['Easy', 'Hard', 'Expert'];

    // Fetch levels for each difficulty
    const easyLevels = await getLevelsByDifficulty('Easy');
    const hardLevels = await getLevelsByDifficulty('Hard');
    const expertLevels = await getLevelsByDifficulty('Expert');

    const levelsByDifficulty = {
        Easy: easyLevels.data?.slice(0, MAX_GAMES_PER_DIFFICULTY) || [],
        Hard: hardLevels.data?.slice(0, MAX_GAMES_PER_DIFFICULTY) || [],
        Expert: expertLevels.data?.slice(0, MAX_GAMES_PER_DIFFICULTY) || [],
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/games" className="text-gray-500 hover:text-purple-600">← All Games</Link>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Games by Difficulty</h1>
            </div>

            <div className="space-y-12">
                {difficulties.map((difficulty) => {
                    const difficultyLevels = levelsByDifficulty[difficulty];
                    if (difficultyLevels.length === 0) return null;

                    const difficultySlug = difficulty.toLowerCase();

                    return (
                        <section key={difficulty}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {difficulty}
                                    <span className={`text-sm px-3 py-1 rounded-full text-white
                  ${difficulty === 'Easy' ? 'bg-green-500' : difficulty === 'Hard' ? 'bg-orange-500' : 'bg-red-600'}`}>
                                        {difficultyLevels.length}+ Games
                                    </span>
                                </h2>
                                <Link
                                    href={`/games/difficulty/${difficultySlug}`}
                                    className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2 transition-colors"
                                >
                                    View All
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {difficultyLevels.map((level) => (
                                    <Link
                                        key={level.id}
                                        href={`/game/${level.slug}`}
                                        className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={level.image_url_1}
                                                alt={level.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {level.category_name && (
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-purple-600">
                                                    {level.category_name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">{level.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">Find {level.differences.length} differences</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
