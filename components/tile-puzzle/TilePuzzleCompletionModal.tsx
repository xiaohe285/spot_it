'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, RotateCcw, X } from 'lucide-react';
import { TilePuzzleStats } from '@/types';
import { calculateTilePuzzleScore } from '@/utils/tilePuzzleScoring';

interface TilePuzzleCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplay: () => void;
  stats: TilePuzzleStats;
}

export default function TilePuzzleCompletionModal({
  isOpen,
  onClose,
  onReplay,
  stats,
}: TilePuzzleCompletionModalProps) {
  const router = useRouter();
  if (!isOpen) return null;
  const scoreBreakdown = calculateTilePuzzleScore(stats);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tile-puzzle-complete-title"
        className="relative w-full max-w-md rounded-[2rem] border border-white/60 bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-slate-900"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="text-center">
          {/* Success Header */}
          <div className="text-6xl mb-4">🎉</div>
          <h2 id="tile-puzzle-complete-title" className="mb-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
            Puzzle Completed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {getPerformanceMessage()}
          </p>

          {/* Star Rating */}
          {renderStars()}

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 dark:from-purple-900/20 dark:to-purple-900/40">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {scoreBreakdown.score}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Score</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 dark:from-blue-900/20 dark:to-blue-900/40">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatTime(stats.timeElapsed)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Time</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 dark:from-green-900/20 dark:to-green-900/40">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.moves}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Moves</div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={onReplay}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-extrabold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Play again
            </button>
            <button
              onClick={handleNextLevel}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 font-extrabold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              More puzzles
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
