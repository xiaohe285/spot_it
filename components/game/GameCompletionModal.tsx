'use client';

import { GameStats } from './GameCanvas';
import { useAuth } from '@/contexts/AuthContext';
import type { GameRecord, UserXpProgress } from '@/lib/gameRecords';
import XpEarnedCard from '@/components/xp/XpEarnedCard';

interface GameCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameStats: GameStats;
  levelTitle: string;
  onShowAuth?: () => void; // Callback to show auth modal
  isRecordSaved?: boolean; // Override the save status (for when user logs in during modal)
  savedRecord?: GameRecord | null;
  xpProgress?: UserXpProgress | null;
  isSaving?: boolean;
}

export default function GameCompletionModal({ 
  isOpen, 
  onClose, 
  gameStats, 
  levelTitle,
  onShowAuth,
  isRecordSaved,
  savedRecord = null,
  xpProgress = null,
  isSaving = false,
}: GameCompletionModalProps) {
  const { user } = useAuth();

  // Determine if record is saved - use prop override if provided, otherwise use user status
  const recordSaved = isRecordSaved !== undefined ? isRecordSaved : !!user;

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (gameStats.accuracy >= 90 && gameStats.timeElapsed <= 120) {
      return "🏆 Outstanding performance!";
    } else if (gameStats.accuracy >= 80) {
      return "⭐ Great job!";
    } else if (gameStats.accuracy >= 70) {
      return "👍 Well done!";
    } else {
      return "💪 Keep practicing!";
    }
  };

  const handleAuthClick = () => {
    onClose();
    onShowAuth?.();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl transform animate-in zoom-in-95 duration-300 dark:bg-gray-800">
        <div className="text-center">
          {/* Success Header */}
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {levelTitle} Completed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getPerformanceMessage()}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {gameStats.score}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Score</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatTime(gameStats.timeElapsed)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Time</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {Math.round(gameStats.accuracy)}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/40 p-4 rounded-xl">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {gameStats.maxCombo}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Max Combo</div>
            </div>
          </div>

          {user && (
            <XpEarnedCard record={savedRecord} progress={xpProgress} saving={isSaving} />
          )}

          {/* User Status Section */}
          {!recordSaved ? (
            /* Not Logged In or Record Not Saved - Show Warning */
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-amber-500 text-xl flex-shrink-0 mt-0.5">⚠️</div>
                <div className="text-left">
                  <h3 className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-1">
                    Progress Not Saved
                  </h3>
                  <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                    Your game record won&apos;t be saved because you&apos;re not signed in. 
                    Sign in to save your progress and track your achievements!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Record Saved - Show Success */
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-green-500 text-xl">✅</div>
                <div className="text-left">
                  <h3 className="font-bold text-green-800 dark:text-green-200 text-sm">
                    Progress Saved!
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-xs">
                    Your record has been saved to your account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!recordSaved ? (
              <>
                <button
                  onClick={handleAuthClick}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Sign In
                  </div>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Continue Playing
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                Continue Playing
              </button>
            )}
          </div>

          {/* Additional Info for Non-logged Users */}
          {!recordSaved && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
              Sign in to save your scores, track streaks, compete on leaderboards, and unlock achievements!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
