import type { GameDifficulty } from '@/types';

export type PerformanceRating = 'S+' | 'S' | 'A' | 'B' | 'C';

export const SCORE_MULTIPLIER = 30;

export interface GameScoreInput {
  timeElapsed: number;
  targetTime?: number | null;
  difficulty: GameDifficulty;
  found: number;
  totalDifferences: number;
  totalClicks: number;
  hintsUsed: number;
}

export interface GameScoreResult {
  score: number;
  accuracy: number;
  completion: number;
  targetTime: number;
  found: number;
  totalDifferences: number;
  timeScore: number;
  accuracyScore: number;
  hintScore: number;
  completionScore: number;
  performance: number;
  rating: PerformanceRating;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const TARGET_TIME_MODEL: Record<
  GameDifficulty,
  { baseTime: number; secondsPerDifference: number }
> = {
  Easy: { baseTime: 20, secondsPerDifference: 12 },
  Medium: { baseTime: 22, secondsPerDifference: 15 },
  Hard: { baseTime: 25, secondsPerDifference: 18 },
  Expert: { baseTime: 30, secondsPerDifference: 24 },
};

const roundToNearestFive = (value: number) => Math.round(value / 5) * 5;

export function calculateTargetTime(
  difficulty: GameDifficulty,
  totalDifferences: number
): number {
  const model = TARGET_TIME_MODEL[difficulty];
  const differenceCount = Math.max(1, Math.round(totalDifferences));
  return roundToNearestFive(
    model.baseTime + differenceCount * model.secondsPerDifference
  );
}

export function resolveTargetTime(
  targetTime: number | null | undefined,
  difficulty: GameDifficulty,
  totalDifferences: number
): number {
  return targetTime && targetTime > 0
    ? Math.round(targetTime)
    : calculateTargetTime(difficulty, totalDifferences);
}

export function calculateTimeScore(
  timeElapsed: number,
  targetTime: number
): number {
  const ratio = Math.max(0, timeElapsed) / Math.max(1, targetTime);
  let score: number;

  if (ratio <= 0.5) score = 100;
  else if (ratio <= 0.75) score = 100 - ((ratio - 0.5) / 0.25) * 10;
  else if (ratio <= 1) score = 90 - ((ratio - 0.75) / 0.25) * 15;
  else if (ratio <= 1.5) score = 75 - ((ratio - 1) / 0.5) * 25;
  else if (ratio <= 2) score = 50 - ((ratio - 1.5) / 0.5) * 50;
  else score = 0;

  return Math.round(clamp(score, 0, 100));
}

function calculateAccuracyScore(accuracy: number): number {
  if (accuracy >= 100) return 100;
  if (accuracy >= 98) return 95;
  if (accuracy >= 95) return 90;
  if (accuracy >= 90) return 80;
  if (accuracy >= 80) return 60;
  if (accuracy >= 70) return 40;
  return 20;
}

function calculateHintScore(hintsUsed: number): number {
  if (hintsUsed <= 0) return 100;
  if (hintsUsed === 1) return 90;
  if (hintsUsed === 2) return 80;
  if (hintsUsed === 3) return 60;
  if (hintsUsed === 4) return 40;
  return 20;
}

function calculateCompletionScore(completion: number): number {
  if (completion >= 1) return 100;
  if (completion >= 0.8) return 70;
  if (completion >= 0.6) return 40;
  return 0;
}

function suggestedRating(performance: number): PerformanceRating {
  if (performance >= 95) return 'S+';
  if (performance >= 90) return 'S';
  if (performance >= 80) return 'A';
  if (performance >= 70) return 'B';
  return 'C';
}

function ratingGatePassed(
  rating: PerformanceRating,
  completion: number,
  hintsUsed: number,
  accuracy: number,
  timeScore: number
): boolean {
  if (rating === 'S+') {
    return completion >= 1 && hintsUsed === 0 && accuracy >= 98 && timeScore >= 90;
  }
  if (rating === 'S') {
    return completion >= 1 && hintsUsed <= 1 && accuracy >= 95;
  }
  if (rating === 'A') return completion >= 1;
  if (rating === 'B') return completion >= 0.8;
  return true;
}

function calculateRating(
  performance: number,
  completion: number,
  hintsUsed: number,
  accuracy: number,
  timeScore: number
): PerformanceRating {
  const ratings: PerformanceRating[] = ['S+', 'S', 'A', 'B', 'C'];
  const startIndex = ratings.indexOf(suggestedRating(performance));

  return ratings
    .slice(startIndex)
    .find((rating) =>
      ratingGatePassed(rating, completion, hintsUsed, accuracy, timeScore)
    ) ?? 'C';
}

/**
 * Performance V1 from docs/得分和XP计算规则.md.
 * Performance is scaled to a maximum of 3,000 points so new scores remain
 * comparable with historical game records.
 */
export function calculateGameScore(input: GameScoreInput): GameScoreResult {
  const totalDifferences = Math.max(1, input.totalDifferences);
  const targetTime = resolveTargetTime(
    input.targetTime,
    input.difficulty,
    totalDifferences
  );
  const found = clamp(input.found, 0, totalDifferences);
  const totalClicks = Math.max(1, input.totalClicks);
  const accuracy = clamp((found / totalClicks) * 100, 0, 100);
  const completion = clamp(found / totalDifferences, 0, 1);

  const timeScore = calculateTimeScore(input.timeElapsed, targetTime);
  const accuracyScore = calculateAccuracyScore(accuracy);
  const hintScore = calculateHintScore(Math.max(0, input.hintsUsed));
  const completionScore = calculateCompletionScore(completion);
  const performance = Math.round(
    0.4 * timeScore +
      0.3 * accuracyScore +
      0.2 * hintScore +
      0.1 * completionScore
  );
  const rating = calculateRating(
    performance,
    completion,
    input.hintsUsed,
    accuracy,
    timeScore
  );

  return {
    score: performance * SCORE_MULTIPLIER,
    accuracy,
    completion,
    targetTime,
    found,
    totalDifferences,
    timeScore,
    accuracyScore,
    hintScore,
    completionScore,
    performance,
    rating,
  };
}
