import { use } from 'react';
import Link from 'next/link';
import { levels } from '@/data/levels';
import GameCanvas from '@/components/game/GameCanvas';

export default function DailyChallengeDetailPage({ params }: { params: Promise<{ year: string; month: string; day: string }> }) {
    const { year, month, day } = use(params);
    const dateStr = `${year}-${month}-${day}`;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // In a real app, we would fetch the specific challenge for this date
    // For now, we'll just pick a random level based on the date to simulate variety
    const levelIndex = (parseInt(year) + parseInt(month) + parseInt(day)) % levels.length;
    const level = levels[levelIndex];

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
                            Score: 0
                        </div>
                    </div>
                </div>

                <div className="p-6 flex justify-center bg-gray-100 dark:bg-gray-900">
                    <GameCanvas level={level} />
                </div>
            </div>
        </div>
    );
}
