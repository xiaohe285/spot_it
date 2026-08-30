'use client';

import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import type { GameRecord, UserXpProgress } from '@/lib/gameRecords';
import { getLevelProgress, getXpBonusLabel, levelFromXp } from '@/lib/xp';

interface XpEarnedCardProps {
  record: GameRecord | null;
  progress: UserXpProgress | null;
  saving?: boolean;
}

export default function XpEarnedCard({ record, progress, saving = false }: XpEarnedCardProps) {
  if (saving) {
    return (
      <div className="mb-5 animate-pulse rounded-2xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-900/50 dark:bg-purple-950/30">
        <div className="mx-auto h-5 w-40 rounded bg-purple-200 dark:bg-purple-800" />
        <div className="mx-auto mt-3 h-9 w-24 rounded bg-purple-200 dark:bg-purple-800" />
      </div>
    );
  }

  if (!record || record.xp_earned === undefined) return null;

  const xpEarned = Number(record.xp_earned || 0);
  const totalXp = Number(progress?.total_xp || xpEarned);
  const currentProgress = getLevelProgress(totalXp);
  const previousLevel = levelFromXp(Math.max(0, totalXp - xpEarned));
  const currentLevel = Number(progress?.current_level || currentProgress.level);
  const bonusDetails = Object.entries(record.xp_bonus_details || {});
  const multiplier = Number(record.difficulty_multiplier || 1);
  const replayMultiplier = Number(record.replay_multiplier || 1);

  return (
    <div className="mb-5 overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-orange-50 shadow-sm dark:border-purple-800/60 dark:from-purple-950/50 dark:via-fuchsia-950/30 dark:to-orange-950/30">
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-purple-700 dark:text-purple-200">
            <Sparkles size={18} /> XP Earned
          </div>
          {currentLevel > previousLevel && (
            <span className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-xs font-black text-white shadow-sm">
              Level Up!
            </span>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between gap-4">
          <div className="text-4xl font-black tracking-tight text-purple-700 dark:text-purple-200">+{xpEarned.toLocaleString()} XP</div>
          <div className="text-right">
            <div className="text-lg font-black text-gray-900 dark:text-white">Level {currentLevel}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{totalXp.toLocaleString()} total XP</div>
          </div>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-purple-100 dark:bg-gray-900/60 dark:ring-purple-900">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500 transition-all duration-700"
            style={{ width: `${currentProgress.percentage}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-gray-500 dark:text-gray-400">
          <span>{currentProgress.xpIntoLevel.toLocaleString()} / {currentProgress.xpSpan.toLocaleString()} XP</span>
          <span>{currentProgress.xpToNextLevel.toLocaleString()} to next level</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/70 p-2 dark:bg-black/20">
            <div className="font-black text-gray-900 dark:text-white">{Number(record.base_xp || 0)}</div>
            <div className="text-[10px] uppercase text-gray-500">Base</div>
          </div>
          <div className="rounded-xl bg-white/70 p-2 dark:bg-black/20">
            <div className="font-black text-gray-900 dark:text-white">+{Number(record.performance_bonus_xp || 0)}</div>
            <div className="text-[10px] uppercase text-gray-500">Performance</div>
          </div>
          <div className="rounded-xl bg-white/70 p-2 dark:bg-black/20">
            <div className="font-black text-gray-900 dark:text-white">+{Number(record.achievement_bonus_xp || 0)}</div>
            <div className="text-[10px] uppercase text-gray-500">Achievements</div>
          </div>
        </div>

        {(multiplier !== 1 || replayMultiplier !== 1) && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
            {multiplier !== 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-orange-700 dark:bg-orange-950/60 dark:text-orange-200">
                <TrendingUp size={13} /> Difficulty ×{multiplier.toFixed(1)}
              </span>
            )}
            {replayMultiplier !== 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-blue-700 dark:bg-blue-950/60 dark:text-blue-200">
                <Zap size={13} /> Replay base XP ×{replayMultiplier.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {bonusDetails.length > 0 && (
          <div className="mt-3 border-t border-purple-100 pt-3 dark:border-purple-900/60">
            <div className="flex flex-wrap justify-center gap-2">
              {bonusDetails.map(([key, amount]) => (
                <span key={key} className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-purple-700 shadow-sm dark:bg-black/20 dark:text-purple-200">
                  {getXpBonusLabel(key)} +{Number(amount)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
