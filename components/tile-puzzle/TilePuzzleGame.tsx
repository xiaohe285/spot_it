'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TilePuzzle } from '@/types';
import TilePuzzleCanvas from './TilePuzzleCanvas';
import TilePuzzleCompletionModal from './TilePuzzleCompletionModal';

interface TilePuzzleGameProps {
  puzzle: TilePuzzle;
}

export default function TilePuzzleGame({ puzzle }: TilePuzzleGameProps) {
  const [gridSize, setGridSize] = useState(3);
  const [gameStarted, setGameStarted] = useState(true); // Auto-start game
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [finalStats, setFinalStats] = useState<{ stars: number; timeElapsed: number; moves: number } | null>(null);

  // Timer
  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted]);

  // Calculate star rating based on time and moves
  const calculateStars = useCallback((time: number, moveCount: number, size: number) => {
    const baseTimeThresholds = {
      threeStar: 60,
      twoStar: 120,
    };

    const baseMoveThresholds = {
      threeStar: 15,
      twoStar: 30,
    };

    const sizeMultiplier = Math.pow(size / 3, 2);

    const timeThresholds = {
      threeStar: baseTimeThresholds.threeStar * sizeMultiplier,
      twoStar: baseTimeThresholds.twoStar * sizeMultiplier,
    };

    const moveThresholds = {
      threeStar: baseMoveThresholds.threeStar * sizeMultiplier,
      twoStar: baseMoveThresholds.twoStar * sizeMultiplier,
    };

    let timeStars = 1;
    if (time <= timeThresholds.threeStar) timeStars = 3;
    else if (time <= timeThresholds.twoStar) timeStars = 2;

    let moveStars = 1;
    if (moveCount <= moveThresholds.threeStar) moveStars = 3;
    else if (moveCount <= moveThresholds.twoStar) moveStars = 2;

    return Math.min(timeStars, moveStars);
  }, []);

  // Handle game completion
  const handleComplete = useCallback((stats: { moves: number; timeElapsed: number }) => {
    const stars = calculateStars(stats.timeElapsed, stats.moves, gridSize);
    setFinalStats({ stars, timeElapsed: stats.timeElapsed, moves: stats.moves });
    setShowCompletionModal(true);
    setGameStarted(false); // Stop the timer
  }, [calculateStars, gridSize]);

  // Start/Restart game
  const startGame = useCallback(() => {
    setGameStarted(true);
    setTimeElapsed(0);
    setMoves(0);
    setGameKey(prev => prev + 1);
    setShowCompletionModal(false);
    setFinalStats(null);
  }, []);

  // Change grid size (restart game immediately)
  const handleGridSizeChange = useCallback((newSize: number) => {
    setGridSize(newSize);
    setGameStarted(true);
    setTimeElapsed(0);
    setMoves(0);
    setGameKey(prev => prev + 1);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen">
      {/* Compact Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Breadcrumb Navigation */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Link
                href="/tile-puzzle"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Puzzles
              </Link>
              <span className="text-gray-400 dark:text-gray-600">/</span>
              <h1 className="text-gray-900 dark:text-white font-bold text-sm md:text-base truncate">
                {puzzle.title}
              </h1>
            </div>

            {/* Center: Timer (always visible) */}
            <div className="flex items-center gap-2 px-4">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                {formatTime(timeElapsed)}
              </span>
            </div>

            {/* Right: Stats and Controls */}
            <div className="flex items-center gap-3">
              {/* Moves Counter (always visible) */}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full">
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-900 dark:text-white leading-none">{moves}</div>
                  <div className="text-[10px] text-gray-600 dark:text-gray-400 leading-none">moves</div>
                </div>
              </div>

              {/* Best Stars Display (placeholder for future feature) */}
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <div className="text-center">
                  <svg className="w-5 h-5 text-yellow-500 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                  <div className="text-[10px] text-yellow-600 dark:text-yellow-400 leading-none font-bold">Best</div>
                </div>
              </div>

              {/* Grid Size Label and Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Grid Size</span>
                <div className="relative">
                  <select
                    value={gridSize}
                    onChange={(e) => handleGridSizeChange(Number(e.target.value))}
                    className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full px-4 py-2 pr-8 text-sm font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={3}>3×3</option>
                    <option value={4}>4×4</option>
                    <option value={5}>5×5</option>
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg overflow-hidden">
            <TilePuzzleCanvas
              key={gameKey}
              imageUrl={puzzle.imageUrl}
              gridSize={gridSize}
              onComplete={handleComplete}
              onMoveCountChange={setMoves}
            />
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {finalStats && (
        <TilePuzzleCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          stats={{
            stars: finalStats.stars,
            timeElapsed: finalStats.timeElapsed,
            moves: finalStats.moves,
            gridSize,
          }}
          puzzleTitle={puzzle.title}
          onPlayAgain={startGame}
        />
      )}
    </div>
  );
}
