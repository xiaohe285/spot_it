import { TilePuzzleStats } from '@/types';

const SCORE_PER_TILE = 250;
const STAR_BONUS_RATE = 0.25;
const OVERTIME_PENALTY_PER_SECOND = 2;
const MOVE_PENALTY = 10;
const MINIMUM_SCORE_RATE = 0.1;

export interface TilePuzzleScoreBreakdown {
  score: number;
  baseScore: number;
  starBonus: number;
  timePenalty: number;
  movePenalty: number;
  minimumScore: number;
  targetTime: number;
  targetMoves: number;
  minimumApplied: boolean;
}

export function getTilePuzzleTargets(gridSize: number) {
  const sizeMultiplier = Math.pow(gridSize / 3, 2);

  return {
    targetTime: Math.round(60 * sizeMultiplier),
    targetMoves: Math.round(15 * sizeMultiplier),
  };
}

export function calculateTilePuzzleStars(timeElapsed: number, moves: number, gridSize: number) {
  const { targetTime, targetMoves } = getTilePuzzleTargets(gridSize);
  const timeStars = timeElapsed <= targetTime ? 3 : timeElapsed <= targetTime * 2 ? 2 : 1;
  const moveStars = moves <= targetMoves ? 3 : moves <= targetMoves * 2 ? 2 : 1;

  return Math.min(timeStars, moveStars);
}

export function calculateTilePuzzleScore(stats: TilePuzzleStats): TilePuzzleScoreBreakdown {
  const { gridSize, stars, timeElapsed, moves } = stats;
  const { targetTime, targetMoves } = getTilePuzzleTargets(gridSize);
  const baseScore = gridSize * gridSize * SCORE_PER_TILE;
  const starBonus = Math.round(baseScore * STAR_BONUS_RATE * Math.max(0, stars - 1));
  const overtimeSeconds = Math.max(0, timeElapsed - targetTime);
  const timePenalty = overtimeSeconds * OVERTIME_PENALTY_PER_SECOND;
  const movePenalty = moves * MOVE_PENALTY;
  const minimumScore = Math.round(baseScore * MINIMUM_SCORE_RATE);
  const calculatedScore = baseScore + starBonus - timePenalty - movePenalty;
  const score = Math.max(minimumScore, calculatedScore);

  return {
    score,
    baseScore,
    starBonus,
    timePenalty,
    movePenalty,
    minimumScore,
    targetTime,
    targetMoves,
    minimumApplied: calculatedScore < minimumScore,
  };
}
