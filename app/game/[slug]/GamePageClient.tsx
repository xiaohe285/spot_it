'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GameCanvas, { GameStats } from '@/components/game/GameCanvas';
import { getLevelBySlug, type LevelWithCategory } from '@/lib/levels';
interface LevelForCalculation {
  difficulty: 'Easy' | 'Hard' | 'Expert';
}
import { checkEarnedBadges, saveEarnedBadges, Badge } from '@/utils/badgeSystem';
import { generateShareText, shareToTwitter, copyToClipboard } from '@/utils/shareUtils';
import { useAuth } from '@/contexts/AuthContext';
import { saveGameRecord } from '@/lib/gameRecords';
import StructuredData from '@/components/seo/StructuredData';
import { getGameSchema, getBreadcrumbSchema } from '@/lib/structuredData';

// Interface for header stats
interface HeaderStats {
    progress: number;
    timeElapsed: number;
    combo: number;
    hintsUsed: number;
    maxHints: number;
    onHint: () => void;
    onSOS: () => void;
}

// Calculate star rating based on performance
function calculateStars(stats: GameStats, level: LevelForCalculation): number {
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
    const { user } = useAuth();
    const [isComplete, setIsComplete] = useState(false);
    const [stats, setStats] = useState<GameStats | null>(null);
    const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
    const [level, setLevel] = useState<LevelWithCategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFromDailyChallenge, setIsFromDailyChallenge] = useState(false);
    const [headerStats, setHeaderStats] = useState<HeaderStats | null>(null);

    // Check if user came from daily challenge page
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Primary method: Check URL search params
            const urlParams = new URLSearchParams(window.location.search);
            const fromParam = urlParams.get('from');
            
            // Secondary method: Check referrer as fallback
            const referrer = document.referrer;
            
            console.log('GamePageClient - URL from param:', fromParam);
            console.log('GamePageClient - Referrer:', referrer);
            
            const isFromDaily = fromParam === 'daily' ||
                              referrer.includes('/daily/today') || 
                              referrer.includes('/daily/archive') ||
                              Boolean(referrer.match(/\/daily\/\d{4}\/\d{1,2}\/\d{1,2}/));
            
            console.log('GamePageClient - Is from daily challenge:', isFromDaily);
            setIsFromDailyChallenge(isFromDaily);
        }
    }, []);

    useEffect(() => {
        async function loadLevel() {
            const { data, error } = await getLevelBySlug(slug);
            if (error || !data) {
                setLoading(false);
                return;
            }
            setLevel(data);
            setLoading(false);
        }
        loadLevel();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading game...</p>
                </div>
            </div>
        );
    }

    if (!level) {
        return <div className="min-h-screen flex items-center justify-center">Level not found</div>;
    }

    const handleComplete = async (gameStats: GameStats) => {
        setStats(gameStats);
        setIsComplete(true);

        // Check and save earned badges to localStorage
        const badges = checkEarnedBadges(gameStats, level);
        setEarnedBadges(badges);
        if (badges.length > 0) {
            saveEarnedBadges(badges, level.slug, gameStats);
        }

        // Save game record to Supabase if user is logged in
        if (user) {
            const stars = calculateStars(gameStats, level);
            const badgeIds = badges.map((b) => b.id);

            const { error } = await saveGameRecord(
                user.id,
                level.id,
                level.slug,
                level.title,
                gameStats,
                stars,
                badgeIds
            );

            if (error) {
                console.error('Failed to save game record:', error);
            }
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


    // Prepare structured data
    const breadcrumbItems = [
        { name: 'Home', url: 'https://spotdiffs.com' },
        { name: 'Games', url: 'https://spotdiffs.com/games' },
        { name: level.title, url: `https://spotdiffs.com/game/${level.slug}` },
    ];

    return (
        <>
            <StructuredData data={[getGameSchema(level), getBreadcrumbSchema(breadcrumbItems)]} />
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
                {/* Game Header with Breadcrumb */}
                <div className="bg-gray-100 dark:bg-gray-800 p-2 md:p-1 shadow-md">
                    <div className="w-full max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            {/* Left: Breadcrumb Navigation with Title and Badge */}
                            <div className="flex items-center gap-3">
                                <Link href="/games" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium">
                                    Games
                                </Link>
                                <span className="text-gray-400 dark:text-gray-500">/</span>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{level.title}</h1>
                                
                                {/* Difficulty Capsule Badge */}
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                                    level.difficulty === 'Easy' 
                                        ? 'bg-emerald-500' 
                                        : level.difficulty === 'Hard' 
                                        ? 'bg-amber-500 shadow-amber-300/30' 
                                        : 'bg-red-500 shadow-red-300/30'
                                }`}>
                                    {level.difficulty}
                                </span>
                            </div>
                            
                            {/* Center: Time and Combo (Desktop Only) */}
                            {headerStats && (
                                <div className="hidden md:flex items-center gap-4">
                                    {/* Timer */}
                                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                                        <span className="text-xl">⏱️</span>
                                        <span className="text-xl font-mono font-bold">
                                            {Math.floor(headerStats.timeElapsed / 60)}:{(headerStats.timeElapsed % 60).toString().padStart(2, '0')}
                                        </span>
                                    </div>

                                    {/* Combo (if > 1) */}
                                    {headerStats.combo > 1 && (
                                        <div className="flex items-center gap-1">
                                            <span className="text-xl">🔥</span>
                                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">×{headerStats.combo}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Right: Game Progress and Tools (Desktop Only) */}
                            {headerStats && (
                                <div className="hidden md:flex items-center gap-4">
                                    {/* Circular Progress */}
                                    <div className="relative w-15 h-15">
                                        <svg className="w-15 h-15 transform -rotate-90" viewBox="0 0 60 60">
                                            <circle
                                                cx="30"
                                                cy="30"
                                                r="24"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeWidth="5"
                                                className="text-gray-300 dark:text-gray-600"
                                            />
                                            <circle
                                                cx="30"
                                                cy="30"
                                                r="24"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeWidth="5"
                                                strokeLinecap="round"
                                                className="text-emerald-500 transition-all duration-500"
                                                style={{
                                                    strokeDasharray: `${2 * Math.PI * 24}`,
                                                    strokeDashoffset: `${2 * Math.PI * 24 * (1 - headerStats.progress / 100)}`
                                                }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                                    {Math.floor(headerStats.progress * level.differences.length / 100)}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-400 leading-none">
                                                    / {level.differences.length}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hint Button */}
                                    <button
                                        onClick={headerStats.onHint}
                                        disabled={headerStats.hintsUsed >= headerStats.maxHints}
                                        className={`relative w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                                            headerStats.hintsUsed >= headerStats.maxHints
                                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                                : 'bg-yellow-400 text-white hover:bg-yellow-500 hover:scale-110 hover:shadow-lg hover:shadow-yellow-300/50 cursor-pointer'
                                        }`}
                                    >
                                        <span>💡</span>
                                        {headerStats.maxHints - headerStats.hintsUsed > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                {headerStats.maxHints - headerStats.hintsUsed}
                                            </span>
                                        )}
                                    </button>

                                    {/* SOS Button */}
                                    <button
                                        onClick={headerStats.onSOS}
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200 text-white hover:scale-110 hover:shadow-lg cursor-pointer"
                                        style={{ backgroundColor: '#ff690078' }}
                                        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ff6900aa'}
                                        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#ff690078'}
                                    >
                                        <span>🆘</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            {/* Game Area */}
            <div className="flex-grow flex items-center justify-center p-1">
                <GameCanvas level={level} onComplete={handleComplete} onHeaderUpdate={setHeaderStats} />
            </div>

            {/* Simplified Completion Modal */}
            {isComplete && stats && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-3xl max-w-lg w-full shadow-2xl border-2 border-yellow-500/30 relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsComplete(false)}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all hover:scale-110 z-10"
                            aria-label="Close"
                        >
                            <span className="text-xl font-bold">×</span>
                        </button>

                        {/* Header with Performance Message */}
                        <div className="text-center mb-5">
                            <div className="text-4xl mb-2">🎉</div>
                            <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                {stars === 3 && "🏆 Perfect! You're a true master!"}
                                {stars === 2.5 && "✨ Amazing performance!"}
                                {stars === 2 && "👍 Great job!"}
                                {stars === 1.5 && "👏 Well done!"}
                                {stars === 1 && "🎯 Good effort!"}
                            </h2>
                        </div>

                        {/* Score and Stars Combined */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-5 text-center mb-4">
                            <div className="text-sm text-purple-200 uppercase tracking-wide font-semibold mb-1">Total Score</div>
                            <div className="text-5xl font-black mb-3">{stats.score.toLocaleString()}</div>
                            <div className="flex justify-center gap-1">
                                {[...Array(3)].map((_, i) => {
                                    if (i < fullStars) {
                                        return <span key={i} className="text-4xl">⭐</span>;
                                    } else if (i === fullStars && hasHalfStar) {
                                        return <span key={i} className="text-4xl opacity-50">⭐</span>;
                                    } else {
                                        return <span key={i} className="text-4xl text-gray-700">⭐</span>;
                                    }
                                })}
                            </div>
                        </div>

                        {/* Key Stats - 3 Items Only */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {/* Time */}
                            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                                <span className="text-2xl block mb-1">⏱️</span>
                                <div className="text-lg font-bold">
                                    {Math.floor(stats.timeElapsed / 60)}:{(stats.timeElapsed % 60).toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Time</div>
                            </div>

                            {/* Accuracy */}
                            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                                <span className="text-2xl block mb-1">🎯</span>
                                <div className="text-lg font-bold">{stats.accuracy.toFixed(1)}%</div>
                                <div className="text-xs text-gray-400 mt-1">Accuracy</div>
                            </div>

                            {/* Max Combo or Hints */}
                            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                                <span className="text-2xl block mb-1">{stats.hintsUsed > 0 ? '💡' : '🔥'}</span>
                                <div className="text-lg font-bold">
                                    {stats.hintsUsed > 0 ? stats.hintsUsed : `${stats.maxCombo}x`}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">{stats.hintsUsed > 0 ? 'Hints' : 'Combo'}</div>
                            </div>
                        </div>

                        {/* Earned Badges - Compact */}
                        {earnedBadges.length > 0 && (
                            <div className="mb-4 p-3 bg-yellow-900/20 rounded-xl border border-yellow-700/30">
                                <div className="flex items-center justify-center gap-3 flex-wrap">
                                    <span className="text-sm font-semibold text-yellow-400">🎖️ Earned:</span>
                                    {earnedBadges.map((badge) => (
                                        <div key={badge.id} className="flex items-center gap-1.5">
                                            <span className="text-xl">{badge.icon}</span>
                                            <span className="text-sm font-bold">{badge.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share Buttons - Simplified */}
                        <div className="flex gap-2 mb-5 cursor-pointer">
                            <button
                                onClick={handleShareTwitter}
                                className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-semibold transition-all border border-blue-500/30"
                            >
                                <span>𝕏</span>
                                <span>Share</span>
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold transition-all border border-gray-600"
                            >
                                 🔄 Replay
                            </button>
                        </div>

                        {/* Action Buttons - Emphasized Primary */}
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    console.log('Next Level clicked - isFromDailyChallenge:', isFromDailyChallenge);
                                    // If user came from daily challenge, redirect to games page
                                    // to avoid going back to today's challenge (which can only be played once)
                                    if (isFromDailyChallenge) {
                                        console.log('Redirecting to /games');
                                        router.push('/games');
                                    } else {
                                        console.log('Going back to previous page');
                                        router.back();
                                    }
                                }}
                                className="cursor-pointer w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02]"
                            >
                                {isFromDailyChallenge ? 'Browse More Games →' : 'Next Level →'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
}
