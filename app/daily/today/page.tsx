import { Metadata } from 'next';
import Link from 'next/link';

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

export default function DailyChallengePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
                <span className="inline-block px-4 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm mb-6">
                    TODAY'S CHALLENGE
                </span>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white">The Hidden Temple</h1>
                    <Link href="/daily/archive" className="text-purple-600 font-bold hover:underline">
                        View Archive →
                    </Link>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                    Find 10 differences in under 2 minutes to earn double points and a special badge!
                </p>

                <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12 group cursor-pointer">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"
                        alt="Daily Challenge"
                        className="w-full h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <Link
                            href="/game/mountain-peaks"
                            className="px-10 py-5 bg-white text-gray-900 rounded-full font-bold text-xl hover:bg-yellow-400 transition-colors shadow-lg transform hover:scale-105"
                        >
                            Play Challenge
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-3xl mb-4">🏆</div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Win Prizes</h3>
                        <p className="text-gray-500">Top 10 players today get a special profile badge.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-3xl mb-4">⚡️</div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Double XP</h3>
                        <p className="text-gray-500">Earn 2x experience points for every difference found.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-3xl mb-4">🔥</div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Streak</h3>
                        <p className="text-gray-500">Keep your daily streak alive for bonus rewards.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
