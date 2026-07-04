'use client';

import { useRouter } from 'next/navigation';
import { TilePuzzleStats } from '@/types';

interface TilePuzzleCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TilePuzzleStats;
}

export default function TilePuzzleCompletionModal({
  isOpen,
  onClose,
  stats,
}: TilePuzzleCompletionModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    // Base score from stars: 1000, 2000, or 3000
    const baseScore = stats.stars * 1000;
    // Subtract time penalty (5 points per second)
    const timePenalty = stats.timeElapsed * 5;
    // Subtract move penalty (10 points per move)
    const movePenalty = stats.moves * 10;
    // Calculate final score with minimum of 0
    return Math.max(0, baseScore - timePenalty - movePenalty);
  };

  const getPerformanceMessage = () => {
    if (stats.stars === 3) {
      return "🏆 Perfect! Outstanding performance!";
    } else if (stats.stars === 2) {
      return "⭐ Great job! Well done!";
    } else {
      return "👍 Puzzle completed! Keep practicing!";
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((star) => (
          <svg
            key={star}
            className={`w-12 h-12 ${
              star <= stats.stars
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600 fill-none'
            }`}
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        ))}
      </div>
    );
  };

  const handleNextLevel = () => {
    onClose();
    router.push('/tile-puzzle');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-in zoom-in-95 duration-300 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          {/* Success Header */}
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Puzzle Completed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getPerformanceMessage()}
          </p>

          {/* Star Rating */}
          {renderStars()}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 p-4 rounded-xl">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {calculateScore()}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Score</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 p-4 rounded-xl">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatTime(stats.timeElapsed)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Time</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 p-4 rounded-xl">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.moves}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Moves</div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleNextLevel}
            className="cursor-pointer w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2"
          >
            Next Level
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
