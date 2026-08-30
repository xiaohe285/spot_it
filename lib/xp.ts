export const XP_UPDATED_EVENT = 'spotdiffs:xp-updated';

export function xpRequiredForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.floor(level));
  return 100 * Math.pow(normalizedLevel - 1, 2);
}

export function levelFromXp(totalXp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, totalXp) / 100)) + 1);
}

export function getLevelProgress(totalXp: number) {
  const level = levelFromXp(totalXp);
  const levelStartXp = xpRequiredForLevel(level);
  const nextLevelXp = xpRequiredForLevel(level + 1);
  const xpIntoLevel = Math.max(0, totalXp - levelStartXp);
  const xpSpan = Math.max(1, nextLevelXp - levelStartXp);

  return {
    level,
    levelStartXp,
    nextLevelXp,
    xpIntoLevel,
    xpSpan,
    xpToNextLevel: Math.max(0, nextLevelXp - totalXp),
    percentage: Math.min(100, Math.max(0, (xpIntoLevel / xpSpan) * 100)),
  };
}

export function getXpBonusLabel(key: string): string {
  if (key.startsWith('no_hint:')) return 'No Hint';
  if (key.startsWith('perfect_accuracy:')) return '100% Accuracy';
  if (key.startsWith('first_s_plus:')) return 'First S+ Rating';
  if (key.startsWith('first_s:')) return 'First S Rating';
  if (key.startsWith('daily:')) return 'Daily Challenge';
  if (key === 'streak_7d') return '7-Day Streak';
  if (key.startsWith('badge:')) {
    return `New Badge: ${key.slice('badge:'.length).replaceAll('-', ' ')}`;
  }
  return key.replaceAll('_', ' ');
}
