'use client';

import { useState } from 'react';
import FirstAttemptLeaderboard from '@/components/game/FirstAttemptLeaderboard';

interface GameTabsProps {
  description?: string | null;
  levelSlug: string;
  currentUserId?: string | null;
  refreshKey?: string | null;
}

export default function GameTabs({ description, levelSlug, currentUserId, refreshKey }: GameTabsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'stats'>('description');
  const [statsOpened, setStatsOpened] = useState(false);

  return (
    <section className="w-full max-w-7xl mx-auto px-3 py-5 sm:px-4 md:py-7">
      {/* Tab Header */}
      <div className="mb-5 flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('description')}
          className={`whitespace-nowrap px-4 py-3 text-sm font-semibold transition-all sm:px-6 ${
            activeTab === 'description'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Game Description
        </button>
        <button
          onClick={() => {
            setActiveTab('stats');
            setStatsOpened(true);
          }}
          className={`whitespace-nowrap px-4 py-3 text-sm font-semibold transition-all sm:px-6 ${
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
        <div className={activeTab === 'description' ? 'block' : 'hidden'}>
          <div className="leading-relaxed text-gray-700 dark:text-gray-300">
            {description || (
              <p className="text-gray-500 dark:text-gray-500 italic">
                No game description available
              </p>
            )}
          </div>
        </div>

        {statsOpened && (
          <div className={activeTab === 'stats' ? 'block' : 'hidden'}>
            <FirstAttemptLeaderboard
              levelSlug={levelSlug}
              currentUserId={currentUserId}
              refreshKey={refreshKey}
            />
          </div>
        )}
      </div>
    </section>
  );
}
