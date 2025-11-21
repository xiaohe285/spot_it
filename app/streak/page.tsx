import Link from 'next/link';

export default function StreakPage() {
    // Mock data
    const currentStreak = 7;
    const longestStreak = 12;
    const totalDays = 45;
    const freezeUsed = 2;

    // Mock last 30 days (1 = played, 0 = missed, 2 = freeze used)
    // Generating a random-ish pattern for demo
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        if (i >= 23) return 1; // Last 7 days played (current streak)
        const rand = Math.random();
        if (rand > 0.8) return 2; // Freeze used
        return rand > 0.3 ? 1 : 0;
    });

    const milestones = [
        { days: 7, achieved: true },
        { days: 14, achieved: false },
        { days: 30, achieved: false },
        { days: 60, achieved: false },
        { days: 100, achieved: false },
        { days: 365, achieved: false },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">Your Streak</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">🔥</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{currentStreak}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{longestStreak}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Longest Streak</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">📅</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalDays}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Days</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="text-3xl mb-2">❄️</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{freezeUsed}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Freezes Used</div>
                    </div>
                </div>

                {/* Last 30 Days */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Last 30 Days</h2>
                    <div className="grid grid-cols-7 gap-3 sm:gap-4">
                        {last30Days.map((status, index) => (
                            <div
                                key={index}
                                className={`aspect-square rounded-lg flex items-center justify-center text-lg
                  ${status === 1
                                        ? 'bg-orange-500 text-white'
                                        : status === 2
                                            ? 'bg-blue-400 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-600'
                                    }`}
                            >
                                {status === 1 ? '🔥' : status === 2 ? '❄️' : '•'}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Milestones */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Streak Milestones</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {milestones.map((milestone) => (
                            <div
                                key={milestone.days}
                                className={`p-6 rounded-2xl border-2 flex flex-col items-center text-center transition-all
                  ${milestone.achieved
                                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400'
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60 grayscale'
                                    }`}
                            >
                                <div className="text-4xl mb-3">{milestone.days >= 365 ? '👑' : milestone.days >= 100 ? '💯' : '🏅'}</div>
                                <div className={`font-bold text-lg ${milestone.achieved ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {milestone.days} Day Streak
                                </div>
                                {milestone.achieved && (
                                    <div className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mt-2 uppercase tracking-wider">
                                        Unlocked
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Don't Break the Streak! 💪</h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Come back tomorrow to keep your <span className="font-bold text-yellow-300">{currentStreak}-day streak</span> alive.
                    </p>
                    <Link
                        href="/daily/today"
                        className="inline-block px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                    >
                        Play Daily Challenge
                    </Link>
                </div>

            </div>
        </div>
    );
}
