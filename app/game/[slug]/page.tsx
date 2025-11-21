'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GameCanvas, { GameStats } from '@/components/game/GameCanvas';
import { levels } from '@/data/levels';
import { checkEarnedBadges, saveEarnedBadges, Badge } from '@/utils/badgeSystem';
import { generateShareText, shareToTwitter, copyToClipboard } from '@/utils/shareUtils';

// Calculate star rating based on performance
function calculateStars(stats: GameStats, level: any): number {
    const { timeElapsed, accuracy, hintsUsed } = stats;
    const difficultyMultiplier = level.difficulty === 'Easy' ? 1 : level.difficulty === 'Hard' ? 1.3 : 1.6;

    // Time threshold (seconds) - adjusted by difficulty
    const excellentTime = 60 * difficultyMultiplier;
    const goodTime = 120 * difficultyMultiplier;

    let stars = 0;

    // Base star from completion
    stars += 1;

    // Time bonus (up to 1 star)
    if (timeElapsed <= excellentTime) {
        stars += 1;
    } else if (timeElapsed <= goodTime) {
        stars += 0.5;
    }

    // Accuracy bonus (up to 1 star)
    if (accuracy >= 90) {
        stars += 1;
    } else if (accuracy >= 70) {
        stars += 0.5;
    }

    // Hint penalty
    if (hintsUsed > 0) {
        stars -= hintsUsed * 0.3;
    }

    return Math.max(1, Math.min(3, Math.round(stars * 2) / 2)); // Return 1, 1.5, 2, 2.5, or 3
}

export default function GamePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [isComplete, setIsComplete] = useState(false);
    const [stats, setStats] = useState<GameStats | null>(null);
    const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
    const [copySuccess, setCopySuccess] = useState(false);

    const level = levels.find((l) => l.slug === slug);

    if (!level) {
        return <div className="min-h-screen flex items-center justify-center">Level not found</div>;
    }

    const handleComplete = (gameStats: GameStats) => {
        setStats(gameStats);
        setIsComplete(true);

        // Check and save earned badges
        const badges = checkEarnedBadges(gameStats, level);
        setEarnedBadges(badges);
        if (badges.length > 0) {
            saveEarnedBadges(badges, level.slug, gameStats);
        }
    };

    const stars = stats ? calculateStars(stats, level) : 0;
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 !== 0;

    const handleShareTwitter = () => {
        if (!stats) return;
        const shareText = generateShareText({ levelTitle: level.title, stars, stats });
        shareToTwitter(shareText, typeof window !== 'undefined' ? window.location.href : undefined);
    };

    const handleCopyShare = async () => {
        if (!stats) return;
        const shareText = generateShareText({ levelTitle: level.title, stars, stats });
        const success = await copyToClipboard(shareText);
        if (success) {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Game Header */}
            <div className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
                <Link href="/" className="text-gray-200 hover:text-white transition-colors font-medium">
                    ← Back to Home
                </Link>
                <h1 className="text-xl font-bold">{level.title}</h1>
                <div className="text-yellow-400 font-mono text-lg">
                    Difficulty: {level.difficulty}
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-grow flex items-center justify-center p-4">
                <GameCanvas level={level} onComplete={handleComplete} />
            </div>

            {/* Enhanced Completion Modal */}
            {isComplete && stats && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-5 rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-yellow-500/30 my-4 relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsComplete(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all hover:scale-110 z-10"
                            aria-label="Close"
                        >
                            <span className="text-xl font-bold">×</span>
                        </button>

                        {/* Header */}
                        <div className="text-center mb-4">
                            <div className="text-5xl mb-2">🎉</div>
                            <h2 className="text-3xl font-black mb-1 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                Level Complete!
                            </h2>
                            <p className="text-gray-400 text-sm">Excellent work finding all differences!</p>
                        </div>

                        {/* Star Rating */}
                        <div className="flex justify-center gap-2 mb-4">
                            {[...Array(3)].map((_, i) => {
                                if (i < fullStars) {
                                    return <span key={i} className="text-6xl">⭐</span>;
                                } else if (i === fullStars && hasHalfStar) {
                                    return <span key={i} className="text-6xl opacity-50">⭐</span>;
                                } else {
                                    return <span key={i} className="text-6xl text-gray-700">⭐</span>;
                                }
                            })}
                        </div>

                        {/* Stats Grid */}
                        <div className="space-y-3 mb-4">
                            {/* Total Score */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 text-center">
                                <div className="text-xs text-purple-200 uppercase tracking-wide font-semibold mb-1">Total Score</div>
                                <div className="text-4xl font-black">{stats.score.toLocaleString()}</div>
                            </div>

                            {/* 4 Stats in a Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {/* Time */}
                                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-xl">⏱️</span>
                                        <span className="text-xs text-gray-400 uppercase font-semibold">Time</span>
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {Math.floor(stats.timeElapsed / 60)}:{(stats.timeElapsed % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>

                                {/* Accuracy */}
                                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-xl">🎯</span>
                                        <span className="text-xs text-gray-400 uppercase font-semibold">Accuracy</span>
                                    </div>
                                    <div className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</div>
                                </div>

                                {/* Max Combo */}
                                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-xl">🔥</span>
                                        <span className="text-xs text-gray-400 uppercase font-semibold">Max Combo</span>
                                    </div>
                                    <div className="text-2xl font-bold">{stats.maxCombo}x</div>
                                </div>

                                {/* Clicks */}
                                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className="text-xl">👆</span>
                                        <span className="text-xs text-gray-400 uppercase font-semibold">Clicks</span>
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {stats.totalClicks}
                                        <span className="text-sm text-red-400 ml-1">({stats.wrongClicks})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Hints Used */}
                            {stats.hintsUsed > 0 && (
                                <div className="bg-yellow-900/20 rounded-lg p-2.5 border border-yellow-700/30">
                                    <div className="flex items-center gap-2 justify-center">
                                        <span className="text-lg">💡</span>
                                        <span className="text-sm">Used {stats.hintsUsed} hint{stats.hintsUsed > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Performance Message */}
                        <div className="text-center mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                            <p className="text-base font-semibold">
                                {stars === 3 && "🏆 Perfect! You're a true master!"}
                                {stars === 2.5 && "✨ Amazing performance!"}
                                {stars === 2 && "👍 Great job!"}
                                {stars === 1.5 && "👏 Well done!"}
                                {stars === 1 && "🎯 Good effort! Try for more stars next time!"}
                            </p>
                        </div>

                        {/* Earned Badges */}
                        {earnedBadges.length > 0 && (
                            <div className="mb-4 p-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-700/50">
                                <div className="text-center mb-2">
                                    <span className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">
                                        🎖️ Badges Earned
                                    </span>
                                </div>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {earnedBadges.map((badge) => (
                                        <div
                                            key={badge.id}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-yellow-700/30 animate-bounce"
                                        >
                                            <span className="text-2xl">{badge.icon}</span>
                                            <div className="text-left">
                                                <div className="text-sm font-bold text-white">{badge.name}</div>
                                                <div className="text-xs text-gray-400">{badge.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share Buttons */}
                        <div className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                            <div className="text-center mb-2">
                                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                                    Share Your Achievement
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleShareTwitter}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all hover:scale-105"
                                >
                                    <span className="text-lg">𝕏</span>
                                    <span>Share on X</span>
                                </button>
                                <button
                                    onClick={handleCopyShare}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all hover:scale-105"
                                >
                                    <span className="text-lg">{copySuccess ? '✓' : '📋'}</span>
                                    <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2.5">
                            <button
                                onClick={() => router.push('/games')}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/30 transform hover:scale-105"
                            >
                                Next Level →
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-all"
                            >
                                🔄 Replay
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="py-3 px-5 bg-gray-800 text-gray-300 rounded-xl font-bold hover:bg-gray-700 transition-all"
                            >
                                🏠 Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
