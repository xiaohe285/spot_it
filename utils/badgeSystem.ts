// Badge System for achievements
import { GameStats } from '@/components/game/GameCanvas';
import type { GameDifficulty } from '@/types';

interface LevelForCalculation {
  difficulty: GameDifficulty;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: GameStats, level: LevelForCalculation) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'perfect',
    name: 'Perfect',
    description: 'Complete with 100% accuracy',
    icon: '💎',
    condition: (stats) => stats.accuracy === 100,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete in under 60 seconds',
    icon: '⚡',
    condition: (stats) => stats.timeElapsed < 60,
  },
  {
    id: 'combo-master',
    name: 'Combo Master',
    description: 'Achieve 5x combo or higher',
    icon: '🔥',
    condition: (stats) => stats.maxCombo >= 5,
  },
  {
    id: 'eagle-eye',
    name: 'Eagle Eye',
    description: 'Complete without using hints',
    icon: '🦅',
    condition: (stats) => stats.hintsUsed === 0,
  },
];

export interface BadgeRecord {
  badgeId: string;
  earnedAt: string;
  levelSlug: string;
  stats: GameStats;
}

// Check which badges were earned in this game
export function checkEarnedBadges(stats: GameStats, level: LevelForCalculation): Badge[] {
  return BADGES.filter((badge) => badge.condition(stats, level));
}

// Load user's badge collection from localStorage
export function loadUserBadges(): BadgeRecord[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('spot-it-badges');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

// Save earned badges to localStorage
export function saveEarnedBadges(
  badges: Badge[],
  levelSlug: string,
  stats: GameStats
): void {
  if (typeof window === 'undefined') return;

  const existingBadges = loadUserBadges();
  const existingBadgeIds = new Set(existingBadges.map((badge) => badge.badgeId));
  const newRecords: BadgeRecord[] = badges
    .filter((badge) => !existingBadgeIds.has(badge.id))
    .map((badge) => ({
      badgeId: badge.id,
      earnedAt: new Date().toISOString(),
      levelSlug,
      stats,
    }));

  const updated = [...existingBadges, ...newRecords];
  localStorage.setItem('spot-it-badges', JSON.stringify(updated));
}

// Get unique badge count
export function getUniqueBadgeCount(): number {
  const allBadges = loadUserBadges();
  const uniqueBadgeIds = new Set(allBadges.map((b) => b.badgeId));
  return uniqueBadgeIds.size;
}

// Check if user has earned a specific badge before
export function hasBadge(badgeId: string): boolean {
  const allBadges = loadUserBadges();
  return allBadges.some((b) => b.badgeId === badgeId);
}
