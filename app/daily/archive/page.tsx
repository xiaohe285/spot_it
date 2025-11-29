'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDailyChallengeArchive, DailyChallengeArchiveItem } from '@/lib/levels';

export default function DailyChallengeArchivePage() {
    const { user } = useAuth();
    const [archive, setArchive] = useState<DailyChallengeArchiveItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadArchive() {
            try {
                setLoading(true);
                setError(null);
                
                // Get archive data - pass user ID if user is logged in
                const { data, error: archiveError } = await getDailyChallengeArchive(
                    user?.id, 
                    30 // Last 30 days
                );

                if (archiveError) {
                    throw new Error(archiveError.message || 'Failed to load archive');
                }

                setArchive(data || []);
            } catch (err) {
                console.error('Error loading archive:', err);
                setError(err instanceof Error ? err.message : 'Failed to load archive');
            } finally {
                setLoading(false);
            }
        }

        loadArchive();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/daily/today" className="text-gray-500 hover:text-purple-600">← Back to Today</Link>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Challenge Archive</h1>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading archive...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/daily/today" className="text-gray-500 hover:text-purple-600">← Back to Today</Link>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Challenge Archive</h1>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-6 text-center">
                    <h3 className="text-red-800 dark:text-red-300 font-bold mb-2">Failed to Load Archive</h3>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/daily/today" className="text-gray-500 hover:text-purple-600">← Back to Today</Link>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Challenge Archive</h1>
            </div>

            {!user && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-300 text-center">
                        <Link href="/login" className="font-semibold underline hover:text-blue-600">
                            Sign in
                        </Link> to see your personal challenge history and scores.
                    </p>
                </div>
            )}

            {archive.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Challenges Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        No daily challenges have been created yet. Check back later!
                    </p>
                    <Link
                        href="/games"
                        className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Browse All Games
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archive.map((item) => {
                        const date = new Date(item.date);
                        const isCompleted = user && item.userRecord?.completed;
                        const isMissed = user && !item.userRecord?.completed;
                        
                        return (
                            <div
                                key={item.date}
                                className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                                    isCompleted
                                        ? 'border-green-100 dark:border-green-900/30'
                                        : 'border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Difficulty Badge */}
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            item.challenge.level.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                                            item.challenge.level.difficulty === 'Hard' ? 'bg-orange-500 text-white' :
                                            'bg-red-500 text-white'
                                        }`}>
                                            {item.challenge.level.difficulty}
                                        </span>
                                        
                                        {/* Status Badge */}
                                        {user && (
                                            <>
                                                {isCompleted ? (
                                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                                                        Missed
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {item.challenge.special_title || item.challenge.level.title}
                                </h3>

                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    🔍 {item.challenge.level.differences.length} differences
                                    {item.challenge.bonus_multiplier > 1 && (
                                        <span className="ml-2">⚡ {item.challenge.bonus_multiplier}x points</span>
                                    )}
                                </div>

                                {isCompleted && item.userRecord && (
                                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                        Score: <span className="font-bold text-purple-600">{item.userRecord.score}</span>
                                        {item.userRecord.completion_time && (
                                            <span className="ml-3">
                                                Time: <span className="font-bold text-blue-600">
                                                    {Math.floor(item.userRecord.completion_time / 60)}:
                                                    {(item.userRecord.completion_time % 60).toString().padStart(2, '0')}
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                )}

                                {user && isMissed && (
                                    <div className="text-sm text-gray-400 mb-6 italic">
                                        Did not participate
                                    </div>
                                )}

                                {!user && (
                                    <div className="text-sm text-gray-400 mb-6 italic">
                                        Sign in to see your progress
                                    </div>
                                )}

                                <Link
                                    href={`/game/${item.challenge.level.slug}`}
                                    className={`block w-full py-3 rounded-xl font-bold text-center transition-colors ${
                                        isCompleted
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-purple-500/30'
                                    }`}
                                >
                                    {isCompleted ? 'Replay Challenge' : 'Play Challenge'}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
