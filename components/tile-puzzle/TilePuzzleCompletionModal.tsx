'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock3, Heart, Puzzle, RotateCcw, Trophy, X } from 'lucide-react';
import { TilePuzzleStats } from '@/types';
import { calculateTilePuzzleScore } from '@/utils/tilePuzzleScoring';

interface TilePuzzleCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplay: () => void;
  imageUrl: string;
  puzzleTitle: string;
  stats: TilePuzzleStats;
}

export default function TilePuzzleCompletionModal({
  isOpen,
  onClose,
  onReplay,
  imageUrl,
  puzzleTitle,
  stats,
}: TilePuzzleCompletionModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  const score = calculateTilePuzzleScore(stats).score;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletionTitle = () => {
    if (stats.stars === 3) return 'Amazing!';
    if (stats.stars === 2) return 'Great job!';
    return 'Puzzle complete!';
  };

  const getPerformanceMessage = () => {
    if (stats.stars === 3) return 'You completed the puzzle!';
    if (stats.stars === 2) return 'You are getting really good at this!';
    return 'Every piece is in the right place.';
  };

  const renderStars = () => (
    <div className="flex items-center gap-2" aria-label={`${stats.stars} out of 3 stars`}>
      {[1, 2, 3].map((star) => (
        <svg
          key={star}
          className={`h-12 w-12 ${
            star <= stats.stars
              ? 'fill-amber-400 text-amber-400'
              : 'fill-none text-slate-300 dark:text-slate-600'
          }`}
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );

  const handleNextPuzzle = () => {
    onClose();
    router.push('/tile-puzzle');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/30 p-3 backdrop-blur-md sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tile-puzzle-complete-title"
        className="relative max-h-[calc(100dvh-1rem)] w-full max-w-[640px] overflow-x-hidden overflow-y-auto rounded-[1.5rem] border border-white/70 bg-[#fffaf2] p-2 shadow-2xl shadow-slate-950/30 sm:max-h-[calc(100dvh-1.5rem)] sm:rounded-[2rem] sm:p-3 dark:border-white/10 dark:bg-[#172016]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-1 top-1 z-20 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white/90 text-slate-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 sm:right-2 sm:top-2 sm:h-10 sm:w-10 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
          aria-label="Close completion dialog"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="grid min-w-0 gap-2 lg:grid-cols-[0.9fr_1.1fr] lg:gap-3">
          <section className="flex min-w-0 flex-col justify-center px-2 pb-1 pt-9 text-center sm:px-5 lg:py-5 lg:text-left">
            <p className="mb-1.5 flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 sm:text-base lg:justify-start dark:text-emerald-300">
              <span aria-hidden="true">★</span>
              You completed the puzzle!
            </p>
            <h2 id="tile-puzzle-complete-title" className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
              {getCompletionTitle()}
            </h2>
            <p className="mt-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 sm:text-base lg:justify-start dark:text-slate-300">
              {getPerformanceMessage()}
              <Heart className="h-5 w-5 fill-emerald-500 text-emerald-500" aria-hidden="true" />
            </p>
            <div className="mt-4 flex justify-center lg:justify-start">
              {renderStars()}
            </div>
            <p className="mt-4 text-sm font-semibold italic text-slate-500 dark:text-slate-400">
              {stats.stars === 3 ? 'A perfect solve!' : stats.stars === 2 ? 'So close to perfection!' : 'Keep practicing and try again!'}
            </p>
          </section>

          <section className="relative flex min-w-0 items-center justify-center px-1 pb-1 pt-0 sm:px-4 lg:pb-2 lg:pl-2 lg:pr-7 lg:pt-5">
            <div className="relative flex h-[min(38vh,360px)] w-[min(38vh,360px)] max-w-full rotate-[1.5deg] flex-col rounded-[1rem] bg-white p-2 shadow-[0_18px_28px_-16px_rgba(71,52,28,0.5)] transition-transform hover:rotate-0 sm:rounded-[1.25rem] sm:p-2.5 dark:bg-slate-100">
              <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-md bg-white">
                <Image
                  src={imageUrl}
                  alt={`Completed ${puzzleTitle} puzzle`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 460px"
                  className="object-contain"
                />
              </div>
              <p className="shrink-0 truncate px-2 pt-1 text-center font-serif text-sm italic text-slate-700 sm:text-base">
                {puzzleTitle}
              </p>
            </div>
          </section>

          <section className="grid min-w-0 grid-cols-3 divide-x divide-slate-200/80 rounded-[1.25rem] bg-white/80 px-1.5 py-3 shadow-sm sm:px-4 sm:py-4 lg:col-span-2 dark:divide-white/10 dark:bg-white/[0.06]">
            <div className="flex flex-col items-center gap-2 px-2 text-center sm:px-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-600 sm:h-10 sm:w-10 dark:bg-amber-400/15 dark:text-amber-300">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </span>
              <strong className="text-xl font-black text-slate-950 sm:text-2xl dark:text-white">{score}</strong>
              <span className="text-xs font-semibold text-slate-500 sm:text-sm dark:text-slate-400">Score</span>
            </div>
            <div className="flex flex-col items-center gap-2 px-2 text-center sm:px-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-700 sm:h-10 sm:w-10 dark:bg-emerald-400/15 dark:text-emerald-300">
                <Clock3 className="h-5 w-5" aria-hidden="true" />
              </span>
              <strong className="text-xl font-black text-emerald-800 sm:text-2xl dark:text-emerald-200">{formatTime(stats.timeElapsed)}</strong>
              <span className="text-xs font-semibold text-slate-500 sm:text-sm dark:text-slate-400">Time</span>
            </div>
            <div className="flex flex-col items-center gap-2 px-2 text-center sm:px-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-100 text-rose-600 sm:h-10 sm:w-10 dark:bg-rose-400/15 dark:text-rose-300">
                <Puzzle className="h-5 w-5" aria-hidden="true" />
              </span>
              <strong className="text-xl font-black text-rose-700 sm:text-2xl dark:text-rose-200">{stats.moves}</strong>
              <span className="text-xs font-semibold text-slate-500 sm:text-sm dark:text-slate-400">Moves</span>
            </div>
          </section>

          <section className="grid min-w-0 gap-2 sm:grid-cols-2 lg:col-span-2">
            <button
              type="button"
              onClick={handleNextPuzzle}
              className="flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-xl bg-emerald-700 px-5 py-2.5 text-base font-black text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              Next puzzle
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onReplay}
              className="flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-xl bg-emerald-700 px-5 py-2.5 text-base font-black text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Play again
            </button>
          </section>

          <p className="flex items-center justify-center gap-2 pb-0.5 text-xs font-semibold text-slate-500 lg:col-span-2 dark:text-slate-400">
            <Heart className="h-4 w-4 text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            Thanks for playing!
          </p>
        </div>
      </div>
    </div>
  );
}
