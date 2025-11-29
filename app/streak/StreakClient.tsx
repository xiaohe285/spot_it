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
    const [dataLoaded, setDataLoaded] = useState(false);

    // 手动刷新函数
    const refreshData = async () => {
        if (!user?.id) return;
        
        setDataLoaded(false);
        setLoading(true);

        try {
            // Fetch streak stats
            const { data: stats, error: statsError } = await getUserStreakStats(user.id);
            if (!statsError && stats) {
                setStreakStats(stats);
            }

            // Fetch last 30 days activity
            const { data: activity, error: activityError } = await getLast30DaysActivity(user.id);
            if (!activityError && activity) {
                setLast30Days(activity.reverse());
            }

            setDataLoaded(true);
        } catch (error) {
            console.error('Error refreshing streak data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function loadStreakData() {
            if (!user?.id) {
                setLoading(false);
                setDataLoaded(false);
                return;
            }

            // 防止重复加载 - 如果数据已加载且用户ID未变化，则跳过
            if (dataLoaded) {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
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

                setDataLoaded(true);
            } catch (error) {
                console.error('Error loading streak data:', error);
            } finally {
                setLoading(false);
            }
        }

        // 当用户ID变化时重置 dataLoaded 状态
        if (!authLoading && user?.id) {
            loadStreakData();
        } else if (!user?.id) {
            setDataLoaded(false);
            setLoading(false);
        }
    }, [user?.id, authLoading]);

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

    // Generate default data for non-logged in users
    const defaultStreakStats = {
        current_streak: 0,
        longest_streak: 0,
        total_days: 0,
        last_play_date: null as string | null,
    };

    const generateDefault30Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push({
                activity_date: date.toISOString().split('T')[0],
                played: false
            });
        }
        return days;
    };

    // Use real data for logged in users, default data for non-logged in users
    const displayStreakStats = user ? streakStats : defaultStreakStats;
    const displayLast30Days = user ? last30Days : generateDefault30Days();
    const milestones = getStreakMilestones(displayStreakStats.longest_streak);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center flex-1">Your Streak</h1>
                    {user ? (
                        <button
                            onClick={refreshData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            title="Refresh streak data"
                        >
                            <svg 
                                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                                />
                            </svg>
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                // Redirect to homepage with login prompt or handle login
                                window.location.href = '/';
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                            title="Sign in to view your streak data"
                        >
                            <svg 
                                className="w-4 h-4" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                                />
                            </svg>
                            Sign in to view your streak
                        </button>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{displayStreakStats.current_streak}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{displayStreakStats.longest_streak}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">📅</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{displayStreakStats.total_days}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Days</div>
                    </div>
                </div>

                {/* Last 30 Days */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Last 30 Days</h2>
                    <div className="grid grid-cols-7 gap-3 sm:gap-4">
                        {displayLast30Days.map((day, index) => {
                            const date = new Date(day.activity_date);
                            const year = date.getFullYear();
                            const month = date.getMonth() + 1; // getMonth() returns 0-11
                            const dayOfMonth = date.getDate();
                            
                            // Create the URL path: /daily/[year]/[month]/[day]
                            const dailyUrl = `/daily/${year}/${month}/${dayOfMonth}`;
                            
                            return (
                                <Link
                                    key={index}
                                    href={dailyUrl}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-110 hover:shadow-lg ${
                                        day.played
                                            ? 'bg-orange-500 text-white shadow-md hover:bg-orange-600'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    title={`${day.activity_date}: ${day.played ? 'Played' : 'Not played'} - Click to view daily challenge`}
                                >
                                    {dayOfMonth}
                                </Link>
                            );
                        })}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                        Click on any date to view that day&apos;s challenge • Orange = Played that day
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
                {!user ? (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Sign In to Track Your Streak! 📊</h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Create an account to start tracking your daily game streak and unlock achievements!
                        </p>
                        <button
                            onClick={() => {
                                // Redirect to homepage with login prompt
                                window.location.href = '/';
                            }}
                            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Sign In
                        </button>
                    </div>
                ) : displayStreakStats.current_streak > 0 ? (
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Don&apos;t Break the Streak! 💪</h2>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Come back tomorrow to keep your{' '}
                            <span className="font-bold text-yellow-300">{displayStreakStats.current_streak}-day streak</span> alive.
                        </p>
                        <Link
                            href="/games"
                            className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Play Games
                        </Link>
                    </div>
                ) : (
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
