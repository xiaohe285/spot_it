'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Clock3,
  MousePointer2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TilePuzzle } from '@/types';
import { soundEffects } from '@/utils/soundEffects';
import { calculateTilePuzzleStars } from '@/utils/tilePuzzleScoring';
import TilePuzzleDetailAd from '@/components/ads/TilePuzzleDetailAd';
import TilePuzzleCanvas from './TilePuzzleCanvas';
import TilePuzzleCompletionModal from './TilePuzzleCompletionModal';

interface TilePuzzleGameProps {
  puzzle: TilePuzzle;
}

export default function TilePuzzleGame({ puzzle }: TilePuzzleGameProps) {
  const [gridSize, setGridSize] = useState(3);
  const [gameStarted, setGameStarted] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [finalStats, setFinalStats] = useState<{ stars: number; timeElapsed: number; moves: number } | null>(null);

  useEffect(() => {
    soundEffects.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setTimeElapsed(previous => previous + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted]);

  const handleComplete = useCallback((stats: { moves: number; timeElapsed: number }) => {
    const stars = calculateTilePuzzleStars(stats.timeElapsed, stats.moves, gridSize);
    setFinalStats({ stars, timeElapsed: stats.timeElapsed, moves: stats.moves });
    setShowCompletionModal(true);
    setGameStarted(false);

    if (soundEnabled) soundEffects.playComplete();
  }, [gridSize, soundEnabled]);

  const handleSuccessfulGroup = useCallback((connectionCount: number, isComplete: boolean) => {
    if (soundEnabled && !isComplete) {
      soundEffects.playTileJoin(connectionCount);
    }
  }, [soundEnabled]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setTimeElapsed(0);
    setMoves(0);
    setGameKey(previous => previous + 1);
    setShowCompletionModal(false);
    setFinalStats(null);
  }, []);

  const handleGridSizeChange = useCallback((newSize: number) => {
    setGridSize(newSize);
    setGameStarted(true);
    setTimeElapsed(0);
    setMoves(0);
    setGameKey(previous => previous + 1);
    setShowCompletionModal(false);
    setFinalStats(null);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f5f6ff] text-slate-950 dark:bg-[#0b1020] dark:text-white">
      <div className="pointer-events-none absolute -left-24 top-16 -z-10 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-700/20" />
      <div className="pointer-events-none absolute -right-20 top-1/3 -z-10 h-80 w-80 rounded-full bg-fuchsia-200/35 blur-3xl dark:bg-fuchsia-800/15" />

      <header className="border-b border-indigo-100/80 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:min-h-20 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center gap-2 text-sm sm:text-base">
            <Link
              href="/tile-puzzle"
              className="shrink-0 font-semibold text-slate-500 transition-colors hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-300"
            >
              Puzzles
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <h1 className="truncate font-black text-slate-950 dark:text-white">
              {puzzle.title}
            </h1>
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:gap-3 lg:w-auto lg:shrink-0 lg:justify-end">
            <div className="flex items-center gap-2 px-1 text-slate-800 dark:text-slate-100" aria-label={`Time ${formatTime(timeElapsed)}`}>
              <Clock3 className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              <span className="font-mono text-xl font-black tabular-nums sm:text-2xl">{formatTime(timeElapsed)}</span>
            </div>

            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-slate-100 text-center dark:bg-white/10" aria-label={`${moves} moves`}>
              <span className="text-sm font-black leading-none tabular-nums text-slate-900 dark:text-white">{moves}</span>
              <span className="mt-0.5 text-[10px] font-medium leading-none text-slate-500 dark:text-slate-400">moves</span>
            </div>

            <button
              type="button"
              onClick={() => setSoundEnabled(enabled => !enabled)}
              aria-pressed={soundEnabled}
              aria-label={soundEnabled ? 'Mute game sounds' : 'Turn on game sounds'}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-200"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden md:inline">{soundEnabled ? 'Sound on' : 'Sound off'}</span>
            </button>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <label htmlFor="tile-puzzle-grid-size" className="hidden text-sm font-medium text-slate-500 sm:inline dark:text-slate-400">
                Grid Size
              </label>
              <div className="relative">
                <select
                  id="tile-puzzle-grid-size"
                  value={gridSize}
                  onChange={event => handleGridSizeChange(Number(event.target.value))}
                  className="h-11 cursor-pointer appearance-none rounded-full border-0 bg-slate-100 py-0 pl-4 pr-9 text-sm font-black text-slate-900 outline-none transition-colors hover:bg-slate-200 focus-visible:ring-4 focus-visible:ring-indigo-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  <option value={3}>3×3</option>
                  <option value={4}>4×4</option>
                  <option value={5}>5×5</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl items-stretch gap-5 px-4 py-5 sm:px-6 sm:py-7 xl:grid-cols-[minmax(0,660px)_minmax(280px,1fr)]">
        <section aria-label="Puzzle board" className="min-w-0">
          <div className="rounded-[1.75rem] border border-white/90 bg-white/80 p-2.5 shadow-[0_24px_70px_-30px_rgba(49,46,129,0.45)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06] sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 px-1 sm:px-0">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                <MousePointer2 className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                Drag a piece or a green group
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                In progress
              </span>
            </div>

            <TilePuzzleCanvas
              key={gameKey}
              imageUrl={puzzle.imageUrl}
              gridSize={gridSize}
              onComplete={handleComplete}
              onMoveCountChange={setMoves}
              onSuccessfulGroup={handleSuccessfulGroup}
            />
          </div>
        </section>

        <TilePuzzleDetailAd />
      </main>

      {finalStats && (
        <TilePuzzleCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onReplay={startGame}
          stats={{
            stars: finalStats.stars,
            timeElapsed: finalStats.timeElapsed,
            moves: finalStats.moves,
            gridSize,
          }}
        />
      )}
    </div>
  );
}
