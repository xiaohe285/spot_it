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

const medalStyles = {
    1: {
        card: 'from-amber-50 via-yellow-50 to-orange-100 border-amber-200 dark:from-amber-950/50 dark:via-yellow-950/30 dark:to-orange-950/50 dark:border-amber-800/60 md:scale-105',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200',
        score: 'text-blue-600 dark:text-blue-300',
    },
    2: {
        card: 'from-slate-50 via-blue-50 to-indigo-100 border-slate-200 dark:from-slate-900 dark:via-blue-950/40 dark:to-indigo-950/50 dark:border-slate-700',
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
        score: 'text-blue-600 dark:text-blue-300',
    },
    3: {
        card: 'from-orange-50 via-rose-50 to-amber-100 border-orange-200 dark:from-orange-950/40 dark:via-rose-950/30 dark:to-amber-950/40 dark:border-orange-800/60',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200',
        score: 'text-blue-600 dark:text-blue-300',
    },
} as const;

const medalSpritePositions = {
    1: '50% 50%',
    2: '0% 50%',
    3: '100% 50%',
} as const;

function getPlayerName(player: GlobalLeaderboardEntry) {
    return player.display_name || player.username || 'Anonymous';
}

function getPlayerInitial(player: GlobalLeaderboardEntry) {
    return getPlayerName(player)[0].toUpperCase();
}

function getTopPlayerOrder(rank: number) {
    if (rank === 1) return 'md:order-2';
    if (rank === 2) return 'md:order-1';
    return 'md:order-3';
}

function getMedalSpritePosition(rank: number) {
    return medalSpritePositions[rank as 1 | 2 | 3];
}

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [leaderboardData, setLeaderboardData] = useState<GlobalLeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const topPlayers = leaderboardData.filter((player) => player.rank <= 3);
    const remainingPlayers = leaderboardData.filter((player) => player.rank > 3);

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
                        <div>
                            {topPlayers.length > 0 && (
                                <div className="grid gap-4 p-4 md:grid-cols-3 md:gap-5 md:p-6">
                                    {topPlayers.map((player) => {
                                        const style = medalStyles[player.rank as 1 | 2 | 3];

                                        return (
                                            <div
                                                key={player.id}
                                                className={`${getTopPlayerOrder(player.rank)} relative min-h-[230px] overflow-hidden rounded-3xl border bg-gradient-to-br p-5 shadow-lg transition-transform hover:-translate-y-1 ${style.card} ${
                                                    user?.id === player.id ? 'ring-2 ring-purple-400 dark:ring-purple-500' : ''
                                                }`}
                                            >
                                                <div className="relative z-10 flex h-full flex-col justify-between gap-4 md:flex-row md:items-center">
                                                    <div
                                                        className="relative -mt-5 mx-auto h-[204px] w-36 shrink-0 md:mx-0"
                                                        aria-label={`Rank ${player.rank} medal`}
                                                    >
                                                        <div className="absolute left-1/2 top-[61%] h-28 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-pink-500 shadow-inner">
                                                            {player.avatar_url ? (
                                                                <img
                                                                    src={player.avatar_url}
                                                                    alt={`${getPlayerName(player)} avatar`}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-4xl font-black text-white">
                                                                    {getPlayerInitial(player)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div
                                                            className="absolute inset-0 bg-contain bg-no-repeat drop-shadow-2xl"
                                                            style={{
                                                                backgroundImage: "url('/golden_900.png')",
                                                                backgroundPosition: getMedalSpritePosition(player.rank),
                                                                backgroundSize: '300% 100%',
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="min-w-[120px] text-center md:text-left">
                                                        <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                                                            <h2 className="text-lg font-black text-gray-950 dark:text-white">
                                                                {getPlayerName(player)}
                                                            </h2>
                                                            {user?.id === player.id && (
                                                                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`font-mono text-[1.2rem] font-black leading-tight tracking-tight ${style.score}`}>
                                                            {(player.total_score || 0).toLocaleString()}
                                                        </div>
                                                        <div className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-300">Points</div>
                                                        <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                                                            <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}>
                                                                {player.total_games_played || 0} Games
                                                            </span>
                                                            <span className="inline-flex whitespace-nowrap rounded-full bg-white/70 px-3 py-1 text-[0.65rem] font-bold text-gray-600 shadow-sm dark:bg-black/20 dark:text-gray-200">
                                                                Star Avg {player.avg_stars?.toFixed(1) || '0.0'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {remainingPlayers.length > 0 && (
                                <div>
                                    <div className="grid grid-cols-12 gap-4 border-y border-gray-200 bg-gray-50 p-6 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                                        <div className="col-span-2 text-center">Rank</div>
                                        <div className="col-span-6">Player</div>
                                        <div className="col-span-2 hidden text-center sm:block">Games</div>
                                        <div className="col-span-2 text-right sm:col-span-2">Score</div>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {remainingPlayers.map((player) => (
                                            <div
                                                key={player.id}
                                                className={`grid grid-cols-12 items-center gap-4 p-6 transition-colors hover:bg-purple-50 dark:hover:bg-gray-700 ${
                                                    user?.id === player.id ? 'bg-purple-50 dark:bg-gray-700' : ''
                                                }`}
                                            >
                                                <div className="col-span-2 flex justify-center">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-gray-500 dark:text-gray-400">
                                                        {player.rank}
                                                    </div>
                                                </div>
                                                <div className="col-span-6 flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-pink-500 font-bold text-white">
                                                        {player.avatar_url ? (
                                                            <img
                                                                src={player.avatar_url}
                                                                alt={`${getPlayerName(player)} avatar`}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            getPlayerInitial(player)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                                                            {getPlayerName(player)}
                                                            {user?.id === player.id && (
                                                                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Star Avg {player.avg_stars?.toFixed(1) || '0.0'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 hidden text-center text-sm text-gray-600 dark:text-gray-400 sm:block">
                                                    {player.total_games_played || 0}
                                                </div>
                                                <div className="col-span-2 text-right font-mono text-lg font-bold text-purple-600 dark:text-purple-400 sm:col-span-2">
                                                    {(player.total_score || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
