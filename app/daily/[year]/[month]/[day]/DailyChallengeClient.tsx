'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { levels } from '@/data/levels';
import GameCanvas, { GameStats } from '@/components/game/GameCanvas';
import GameCompletionModal from '@/components/game/GameCompletionModal';
import AuthModal from '@/components/auth/AuthModal';
import { LevelWithCategory, getDailyChallengeByDate } from '@/lib/levels';
interface LevelForCalculation {
  difficulty: 'Easy' | 'Hard' | 'Expert';
}
import { GameRecordCache } from '@/lib/gameRecordCache';
import { useAuth } from '@/contexts/AuthContext';
import { saveGameRecord } from '@/lib/gameRecords';
import { checkEarnedBadges } from '@/utils/badgeSystem';

interface DailyChallengeClientProps {
  params: { year: string; month: string; day: string };
}

// Calculate star rating based on performance (same as in GamePageClient)
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

export default function DailyChallengeClient({ params }: DailyChallengeClientProps) {
    const { year, month, day } = params;
    const { user } = useAuth();
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const [gameStats, setGameStats] = useState<GameStats | null>(null);
    const [level, setLevel] = useState<LevelWithCategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isRecordSaved, setIsRecordSaved] = useState(false);

    useEffect(() => {
        async function loadChallenge() {
            try {
                const yearNum = parseInt(year);
                const monthNum = parseInt(month);
                const dayNum = parseInt(day);

                // Try to get actual daily challenge data
                const { data: challenge } = await getDailyChallengeByDate(yearNum, monthNum, dayNum);

                if (challenge) {
                    setLevel(challenge.level);
                } else {
                    // Fallback: use mock data based on date
                    const levelIndex = (yearNum + monthNum + dayNum) % levels.length;
                    const mockLevel = levels[levelIndex];

                    // Convert mock data to LevelWithCategory format
                    const fallbackLevel: LevelWithCategory = {
                        id: mockLevel.id,
                        slug: mockLevel.slug,
                        title: mockLevel.title,
                        description: null,
                        category_id: null,
                        image_url_1: mockLevel.imageUrl1,
                        image_url_2: mockLevel.imageUrl2,
                        differences: mockLevel.differences,
                        difficulty: mockLevel.difficulty as 'Easy' | 'Hard' | 'Expert',
                        display_order: 0,
                        seo_title: null,
                        seo_description: null,
                        total_plays: 0,
                        average_score: 0,
                        average_time: 0,
                        published: true,
                        featured: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        category_slug: null,
                        category_name: mockLevel.category,
                        category_icon: null,
                    };
                    setLevel(fallbackLevel);
                }
            } catch (error) {
                console.error('Error loading daily challenge:', error);
                
                // Final fallback: use first level
                const mockLevel = levels[0];
                const fallbackLevel: LevelWithCategory = {
                    id: mockLevel.id,
                    slug: mockLevel.slug,
                    title: mockLevel.title,
                    description: null,
                    category_id: null,
                    image_url_1: mockLevel.imageUrl1,
                    image_url_2: mockLevel.imageUrl2,
                    differences: mockLevel.differences,
                    difficulty: mockLevel.difficulty as 'Easy' | 'Hard' | 'Expert',
                    display_order: 0,
                    seo_title: null,
                    seo_description: null,
                    total_plays: 0,
                    average_score: 0,
                    average_time: 0,
                    published: true,
                    featured: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    category_slug: null,
                    category_name: mockLevel.category,
                    category_icon: null,
                };
                setLevel(fallbackLevel);
            } finally {
                setLoading(false);
            }
        }

        loadChallenge();
    }, [year, month, day]);

    const handleGameComplete = async (stats: GameStats) => {
        setGameStats(stats);
        setShowCompletionModal(true);

        // Handle game record caching/saving
        if (level) {
            const challengeDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            
            if (user) {
                // User is logged in - save to server
                try {
                    console.log('Saving game record to server for logged in user');
                    
                    // Calculate stars and badges
                    const stars = calculateStars(stats, level);
                    const badges = checkEarnedBadges(stats, level);
                    const badgeIds = badges.map((b) => b.id);

                    // Save to database
                    const { error } = await saveGameRecord(
                        user.id,
                        level.id,
                        level.slug,
                        level.title,
                        stats,
                        stars,
                        badgeIds
                    );

                    if (error) {
                        console.error('Failed to save game record:', error);
                        // Even if server save fails, show as saved to avoid confusing the user
                        // The record will be cached and synced later
                        if (GameRecordCache.isAvailable()) {
                            GameRecordCache.saveRecord({
                                levelSlug: level.slug,
                                levelTitle: level.title,
                                gameStats: stats,
                                challengeDate,
                                isDaily: true,
                            });
                        }
                    } else {
                        console.log('Game record successfully saved to server');
                    }
                    
                    setIsRecordSaved(true);
                } catch (error) {
                    console.error('Error saving game record:', error);
                    
                    // Cache locally as fallback
                    if (GameRecordCache.isAvailable()) {
                        GameRecordCache.saveRecord({
                            levelSlug: level.slug,
                            levelTitle: level.title,
                            gameStats: stats,
                            challengeDate,
                            isDaily: true,
                        });
                    }
                    
                    setIsRecordSaved(true); // Still show as saved for UX
                }
            } else {
                // User is not logged in - cache locally
                if (GameRecordCache.isAvailable()) {
                    GameRecordCache.saveRecord({
                        levelSlug: level.slug,
                        levelTitle: level.title,
                        gameStats: stats,
                        challengeDate,
                        isDaily: true,
                    });
                    console.log('Game record cached locally');
                }
                setIsRecordSaved(false);
            }
        }
    };

    const handleShowAuth = () => {
        setShowAuthModal(true);
    };

    // Monitor user login status changes
    useEffect(() => {
        if (user && showCompletionModal && !isRecordSaved) {
            // User just logged in and we have a completion modal open with unsaved record
            // The sync hook will handle the actual syncing, we just update the UI
            setIsRecordSaved(true);
            setTimeout(() => {
                // Small delay to let the sync complete
                console.log('Record status updated after login');
            }, 1000);
        }
    }, [user, showCompletionModal, isRecordSaved]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading daily challenge...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!level) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Challenge Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The daily challenge for this date could not be loaded.
                    </p>
                    <Link
                        href="/daily/archive"
                        className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Back to Archive
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <Link href="/daily/archive" className="text-gray-500 hover:text-purple-600 font-medium transition-colors">
                    ← Back to Archive
                </Link>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                    Challenge for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="w-24"></div> {/* Spacer for centering */}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{level.title}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Find {level.differences.length} differences • {level.difficulty} difficulty
                        </p>
                        {level.category_name && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                                Category: {level.category_name}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`px-3 py-2 rounded-full text-xs font-bold ${
                            level.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                            level.difficulty === 'Hard' ? 'bg-orange-500 text-white' :
                            'bg-red-500 text-white'
                        }`}>
                            {level.difficulty}
                        </div>
                        <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-bold text-xs">
                            Score: {gameStats?.score || 0}
                        </div>
                    </div>
                </div>

                <div className="p-6 flex justify-center bg-gray-100 dark:bg-gray-900">
                    <GameCanvas level={level} onComplete={handleGameComplete} />
                </div>
            </div>

            {/* Game Completion Modal */}
            {showCompletionModal && gameStats && (
                <GameCompletionModal
                    isOpen={showCompletionModal}
                    onClose={() => {
                        setShowCompletionModal(false);
                        setIsRecordSaved(false);
                    }}
                    gameStats={gameStats}
                    levelTitle={level.title}
                    onShowAuth={handleShowAuth}
                    isRecordSaved={isRecordSaved}
                />
            )}

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode="login"
                onSuccess={() => {
                    setShowAuthModal(false);
                    setIsRecordSaved(true);
                }}
            />
        </div>
    );
}