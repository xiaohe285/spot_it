'use client';

import { useState } from 'react';

interface GameTabsProps {
  description?: string | null;
  averageTime?: number | null; // 平均完成时间（秒）
  averageScore?: number | null; // 平均得分
}

export default function GameTabs({ description, averageTime, averageScore }: GameTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'stats'>('description');

  // 格式化时间（秒 -> 分:秒）
  const formatTime = (seconds?: number | null): string => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // 格式化分数
  const formatScore = (score?: number | null): string => {
    if (!score) return '--';
    return score.toLocaleString('en-US');
  };

  return (
    <div className="hidden md:block w-full max-w-7xl mx-auto px-4 py-6">
      {/* Tab Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          onClick={() => setActiveTab('description')}
          className={`px-6 py-3 font-semibold text-sm transition-all ${
            activeTab === 'description'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Game Description
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-semibold text-sm transition-all ${
            activeTab === 'stats'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Statistics
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[100px]">
        {activeTab === 'description' && (
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {description || (
              <p className="text-gray-500 dark:text-gray-500 italic">
                No game description available
              </p>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Average Time */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Average Time
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                {formatTime(averageTime)}
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Average Score
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {formatScore(averageScore)} <span className="text-lg text-gray-600 dark:text-gray-400">pts</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
