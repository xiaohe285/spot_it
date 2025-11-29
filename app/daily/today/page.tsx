import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getTodaysChallenge } from '@/lib/levels';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Spot the Difference Daily Challenge - Today\'s Puzzle',
  description: 'Play today\'s daily spot the difference challenge! Earn double points and exclusive badges by completing the daily puzzle.',
  openGraph: {
    title: 'Spot the Difference Daily Challenge - Today\'s Puzzle',
    description: 'Play today\'s daily spot the difference challenge! Earn double points and exclusive badges.',
    url: `${siteUrl}/daily/today`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Spot the Difference Daily Challenge - Today\'s Puzzle',
    description: 'Play today\'s daily puzzle and earn exclusive rewards!',
  },
  alternates: {
    canonical: `${siteUrl}/daily/today`,
  },
};

export default async function DailyChallengePage() {
    const { data: todaysChallenge, error } = await getTodaysChallenge();

    if (error) {
        console.error('Error fetching today\'s challenge:', error);
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
                <span className="inline-block px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm mb-6">
                    TODAY'S CHALLENGE
                </span>
                
                {todaysChallenge ? (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <h1 className="text-5xl font-black text-gray-900 dark:text-white">
                                {todaysChallenge.special_title || todaysChallenge.level.title}
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    todaysChallenge.level.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                                    todaysChallenge.level.difficulty === 'Hard' ? 'bg-orange-500 text-white' :
                                    'bg-red-500 text-white'
                                }`}>
                                    {todaysChallenge.level.difficulty}
                                </span>
                                <Link href="/daily/archive" className="text-purple-600 font-bold hover:underline">
                                    View Archive →
                                </Link>
                            </div>
                        </div>
                        
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                            Find {todaysChallenge.level.differences.length} differences to earn {todaysChallenge.bonus_multiplier}x points and the &ldquo;{todaysChallenge.special_badge}&rdquo; badge!
                        </p>

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 group cursor-pointer">
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                            <Image
                                src={todaysChallenge.level.image_url_1}
                                alt={todaysChallenge.level.title}
                                width={1000}
                                height={500}
                                className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <Link
                                    href={`/game/${todaysChallenge.level.slug}`}
                                    className="px-10 py-5 bg-white text-gray-900 rounded-full font-bold text-xl hover:bg-yellow-400 transition-colors shadow-lg transform hover:scale-105"
                                >
                                    Play Challenge
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="text-3xl mb-4">🏆</div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Win Badge</h3>
                                <p className="text-gray-500">Complete today&apos;s challenge to earn the &ldquo;{todaysChallenge.special_badge}&rdquo; badge.</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="text-3xl mb-4">⚡️</div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{todaysChallenge.bonus_multiplier}x Points</h3>
                                <p className="text-gray-500">Earn {todaysChallenge.bonus_multiplier}x experience points for every difference found.</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="text-3xl mb-4">🔥</div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Daily Streak</h3>
                                <p className="text-gray-500">Keep your daily streak alive for bonus rewards and achievements.</p>
                            </div>
                        </div>
                        
                        {todaysChallenge.level.category_name && (
                            <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    Category: {todaysChallenge.level.category_name}
                                </h3>
                                {todaysChallenge.level.description && (
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {todaysChallenge.level.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Fallback when no challenge is available */
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <h1 className="text-5xl font-black text-gray-900 dark:text-white">No Challenge Today</h1>
                            <Link href="/daily/archive" className="text-purple-600 font-bold hover:underline">
                                View Archive →
                            </Link>
                        </div>
                        
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                            Today&apos;s challenge is being prepared. Check back later or explore our game library!
                        </p>

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 bg-gradient-to-br from-purple-500 to-pink-500">
                            <div className="flex items-center justify-center h-[500px]">
                                <div className="text-center text-white">
                                    <div className="text-8xl mb-6">🎯</div>
                                    <h3 className="text-3xl font-bold mb-4">Browse Games</h3>
                                    <p className="text-xl text-purple-100 mb-8">Thousands of puzzles await you!</p>
                                    <Link
                                        href="/games"
                                        className="px-10 py-5 bg-white text-gray-900 rounded-full font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-105"
                                    >
                                        Explore Games
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
