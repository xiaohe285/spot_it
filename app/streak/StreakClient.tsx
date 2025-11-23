'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStreakStats, getLast30DaysActivity, getStreakMilestones } from '@/lib/streaks';

export default function StreakPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [streakStats, setStreakStats] = useState({
        current_streak: 0,
        longest_streak: 0,
        total_days: 0,
        last_play_date: null as string | null,
    });
    const [last30Days, setLast30Days] = useState<{ activity_date: string; played: boolean }[]>([]);

    useEffect(() => {
        async function loadStreakData() {
            if (!user) {
                setLoading(false);
                return;
            }

            setLoading(true);

            // Fetch streak stats
            const { data: stats, error: statsError } = await getUserStreakStats(user.id);
            if (!statsError && stats) {
                setStreakStats(stats);
            }

            // Fetch last 30 days activity
            const { data: activity, error: activityError } = await getLast30DaysActivity(user.id);
            if (!activityError && activity) {
                setLast30Days(activity.reverse()); // Reverse to show oldest first
            }

            setLoading(false);
        }

        if (!authLoading) {
            loadStreakData();
        }
    }, [user, authLoading]);

    const milestones = getStreakMilestones(streakStats.longest_streak);

    // Show loading state
    if (authLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading your streak data...</p>
                </div>
            </div>
        );
    }

    // Show login prompt if not logged in
    if (!user) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="text-6xl mb-6">🔒</div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Login Required</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Please login to view your streak statistics.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Your Streak</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{streakStats.current_streak}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{streakStats.longest_streak}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">📅</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{streakStats.total_days}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Days</div>
                    </div>
                </div>

                {/* Last 30 Days */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Last 30 Days</h2>
                    <div className="grid grid-cols-7 gap-3 sm:gap-4">
                        {last30Days.map((day, index) => (
                            <div
                                key={index}
                                className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110 ${
                                    day.played
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600'
                                }`}
                                title={`${day.activity_date}: ${day.played ? 'Played' : 'Not played'}`}
                            >
                                {day.played ? '🔥' : '•'}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                        🔥 = Played that day • • = No activity
                    </p>
                </div>

                {/* Milestones */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Streak Milestones</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {milestones.map((milestone) => (
                            <div
                                key={milestone.days}
                                className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all hover:scale-105 ${
                                    milestone.achieved
                                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 shadow-lg'
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60 grayscale'
                                }`}
                            >
                                <div className="text-4xl mb-3">{milestone.icon}</div>
                                <div
                                    className={`font-bold text-lg ${
                                        milestone.achieved ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                                    }`}
                                >
                                    {milestone.label}
                                </div>
                                {milestone.achieved && (
                                    <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mt-2 uppercase tracking-wider">
                                        ✓ Unlocked
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                {streakStats.current_streak > 0 && (
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Don't Break the Streak! 💪</h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Come back tomorrow to keep your{' '}
                            <span className="font-bold text-yellow-300">{streakStats.current_streak}-day streak</span> alive.
                        </p>
                        <Link
                            href="/games"
                            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Play Games
                        </Link>
                    </div>
                )}

                {streakStats.current_streak === 0 && (
                    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Start Your Streak Today! 🚀</h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Play a game today to start building your streak!
                        </p>
                        <Link
                            href="/games"
                            className="inline-block px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Play Now
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}
