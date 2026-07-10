'use client';

import { useEffect, useState } from 'react';
import { getGlobalLeaderboard } from '@/lib/gameRecords';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import AuthModal from '@/components/auth/AuthModal';

interface GlobalLeaderboardEntry {
    rank: number;
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    total_score: number;
    total_games_played: number;
    avg_stars: number;
}

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState<GlobalLeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    useEffect(() => {
        async function loadLeaderboard() {
            setLoading(true);
            setError(null);

            const { data, error } = await getGlobalLeaderboard(50);

            if (error) {
                setError('Failed to load leaderboard');
                console.error('Leaderboard error:', error);
            } else if (data) {
                setLeaderboardData(data as unknown as GlobalLeaderboardEntry[]);
            }

            setLoading(false);
        }

        loadLeaderboard();
    }, []);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 text-center">Global Leaderboard</h1>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-12">
                    The top spotters in our community
                </p>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-6">Player</div>
                        <div className="col-span-2 text-center hidden sm:block">Games</div>
                        <div className="col-span-2 sm:col-span-2 text-right">Score</div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="p-12 text-center">
                            <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading leaderboard...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="p-12 text-center">
                            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && leaderboardData.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-2xl mb-4">🎮</p>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                No players on the leaderboard yet!
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Be the first to complete a game and claim the top spot!
                            </p>
                        </div>
                    )}

                    {/* List */}
                    {!loading && !error && leaderboardData.length > 0 && (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {leaderboardData.map((player) => (
                                <div
                                    key={player.id}
                                    className={`grid grid-cols-12 gap-4 p-6 items-center hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors ${
                                        user?.id === player.id ? 'bg-purple-50 dark:bg-gray-700' : ''
                                    }`}
                                >
                                    <div className="col-span-2 flex justify-center">
                                        <div
                                            className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                    ${
                        player.rank === 1
                            ? 'bg-yellow-400 text-white'
                            : player.rank === 2
                            ? 'bg-gray-400 text-white'
                            : player.rank === 3
                            ? 'bg-orange-400 text-white'
                            : 'text-gray-500 dark:text-gray-400'
                    }`}
                                        >
                                            {player.rank}
                                        </div>
                                    </div>
                                    <div className="col-span-6 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                            {(player.display_name || player.username || 'A')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {player.display_name || player.username || 'Anonymous'}
                                                {user?.id === player.id && (
                                                    <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                ⭐ {player.avg_stars?.toFixed(1) || '0.0'} avg
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-center hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                                        {player.total_games_played || 0}
                                    </div>
                                    <div className="col-span-2 sm:col-span-2 text-right font-mono font-bold text-purple-600 dark:text-purple-400 text-lg">
                                        {(player.total_score || 0).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA Card */}
                <div className="mt-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
                    {user ? (
                        // User is logged in
                        <>
                            <div className="text-5xl mb-4">🎯</div>
                            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Climb Higher on the Leaderboard!</h3>
                            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Keep playing games to earn more points and improve your ranking. 
                                The more you play, the better you get, and the higher you climb!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/games"
                                    className="inline-block px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Play More Games
                                </Link>
                                <Link
                                    href="/daily/today"
                                    className="inline-block px-8 py-4 bg-white/20 border-2 border-white/50 text-white rounded-full font-bold text-lg hover:bg-white/30 transition-all"
                                >
                                    Try Daily Challenge
                                </Link>
                            </div>
                        </>
                    ) : (
                        // User is not logged in
                        <>
                            <div className="text-5xl mb-4">👤</div>
                            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Join the Competition!</h3>
                            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Sign in to start playing games and see your username appear on this leaderboard. 
                                Compete with players from around the world!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button 
                                    onClick={() => setShowAuthModal(true)}
                                    className="cursor-pointer inline-block px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Sign In to Play
                                </button>
                                <Link
                                    href="/games"
                                    className="inline-block px-8 py-4 bg-white/20 border-2 border-white/50 text-white rounded-full font-bold text-lg hover:bg-white/30 transition-all"
                                >
                                    Browse Games
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode="login"
                onSuccess={() => {
                    setShowAuthModal(false);
                    // Optionally refresh leaderboard data after login
                    window.location.reload();
                }}
            />
        </div>
    );
}
