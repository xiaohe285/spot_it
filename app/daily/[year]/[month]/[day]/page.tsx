'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { levels } from '@/data/levels';
import GameCanvas, { GameStats } from '@/components/game/GameCanvas';
import { LevelWithCategory } from '@/lib/levels';

export default function DailyChallengeDetailPage({ params }: { params: Promise<{ year: string; month: string; day: string }> }) {
    const { year, month, day } = use(params);
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const [gameStats, setGameStats] = useState<GameStats | null>(null);

    // In a real app, we would fetch the specific challenge for this date
    // For now, we'll just pick a random level based on the date to simulate variety
    const levelIndex = (parseInt(year) + parseInt(month) + parseInt(day)) % levels.length;
    const mockLevel = levels[levelIndex];

    // Convert mock data to LevelWithCategory format
    const level: LevelWithCategory = {
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

    const handleGameComplete = (stats: GameStats) => {
        setGameStats(stats);
    };

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
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Find {level.differences.length} differences</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-bold">
                            Score: {gameStats?.score || 0}
                        </div>
                    </div>
                </div>

                <div className="p-6 flex justify-center bg-gray-100 dark:bg-gray-900">
                    <GameCanvas level={level} onComplete={handleGameComplete} />
                </div>
            </div>
        </div>
    );
}
