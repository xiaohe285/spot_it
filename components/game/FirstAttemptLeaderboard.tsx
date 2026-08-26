'use client';

import { useCallback, useEffect, useState } from 'react';
import { Crown, Medal, RotateCw, Timer, Trophy, Users } from 'lucide-react';
import {
  getLevelFirstAttemptLeaderboard,
  type FirstAttemptLeaderboardData,
  type FirstAttemptLeaderboardEntry,
} from '@/lib/gameRecords';

interface FirstAttemptLeaderboardProps {
  levelSlug: string;
  currentUserId?: string | null;
  refreshKey?: string | null;
}

const podiumStyles = {
  1: {
    card: 'border-amber-300 from-amber-50 via-yellow-50 to-orange-100 shadow-amber-200/70 dark:border-amber-700/70 dark:from-amber-950/60 dark:via-yellow-950/30 dark:to-orange-950/50 dark:shadow-none md:-translate-y-3',
    badge: 'bg-amber-500 text-white shadow-amber-300/60',
    accent: 'text-amber-700 dark:text-amber-300',
  },
  2: {
    card: 'border-slate-300 from-slate-50 via-blue-50 to-indigo-100 shadow-slate-200/70 dark:border-slate-600/70 dark:from-slate-900 dark:via-blue-950/40 dark:to-indigo-950/50 dark:shadow-none',
    badge: 'bg-slate-500 text-white shadow-slate-300/60',
    accent: 'text-slate-700 dark:text-slate-200',
  },
  3: {
    card: 'border-orange-300 from-orange-50 via-rose-50 to-amber-100 shadow-orange-200/70 dark:border-orange-800/70 dark:from-orange-950/50 dark:via-rose-950/30 dark:to-amber-950/40 dark:shadow-none',
    badge: 'bg-orange-600 text-white shadow-orange-300/60',
    accent: 'text-orange-700 dark:text-orange-300',
  },
} as const;

const ratingStyles: Record<FirstAttemptLeaderboardEntry['rating'], string> = {
  'S+': 'from-amber-400 via-orange-500 to-pink-500',
  S: 'from-fuchsia-500 via-purple-500 to-indigo-500',
  A: 'from-sky-400 via-blue-500 to-indigo-500',
  B: 'from-emerald-400 via-teal-500 to-cyan-500',
  C: 'from-slate-400 via-slate-500 to-slate-600',
};

function getPlayerName(player: FirstAttemptLeaderboardEntry) {
  return player.display_name || player.username || 'Player';
}

function getPlayerInitial(player: FirstAttemptLeaderboardEntry) {
  return getPlayerName(player).trim().charAt(0).toUpperCase() || 'P';
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

function formatScore(score: number) {
  return (Number(score) || 0).toLocaleString('en-US');
}

function formatAccuracy(accuracy: number) {
  return `${(Number(accuracy) || 0).toFixed(1)}%`;
}

function RatingBadge({ rating }: { rating: FirstAttemptLeaderboardEntry['rating'] }) {
  return (
    <span className={`inline-flex rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-black text-white shadow-sm ${ratingStyles[rating]}`}>
      {rating}
    </span>
  );
}

function PlayerAvatar({ player, size = 'normal' }: { player: FirstAttemptLeaderboardEntry; size?: 'normal' | 'large' }) {
  const sizeClass = size === 'large' ? 'h-16 w-16 text-xl' : 'h-11 w-11 text-base';

  return (
    <div className={`${sizeClass} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-pink-500 font-black text-white ring-4 ring-white/80 shadow-md dark:ring-gray-900/70`}>
      {player.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={player.avatar_url} alt={`${getPlayerName(player)} avatar`} className="h-full w-full object-cover" />
      ) : (
        getPlayerInitial(player)
      )}
    </div>
  );
}

function PodiumCard({ player, isCurrentUser }: { player: FirstAttemptLeaderboardEntry; isCurrentUser: boolean }) {
  const rank = Number(player.rank) as 1 | 2 | 3;
  const style = podiumStyles[rank];
  const orderClass = rank === 1 ? 'md:order-2' : rank === 2 ? 'md:order-1' : 'md:order-3';

  return (
    <article
      className={`${orderClass} relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 text-center shadow-lg transition-transform hover:-translate-y-1 ${style.card} ${
        isCurrentUser ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-gray-900' : ''
      }`}
    >
      <div className={`absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full shadow-lg ${style.badge}`} aria-label={`Rank ${rank}`}>
        {rank === 1 ? <Crown size={21} strokeWidth={2.5} /> : <Medal size={21} strokeWidth={2.5} />}
      </div>

      <div className="flex flex-col items-center pt-3">
        <PlayerAvatar player={player} size="large" />
        <div className="mt-3 flex min-w-0 max-w-full items-center justify-center gap-2">
          <h4 className="truncate text-lg font-black text-gray-950 dark:text-white">{getPlayerName(player)}</h4>
          {isCurrentUser && (
            <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black uppercase text-purple-700 dark:bg-purple-900/60 dark:text-purple-200">
              You
            </span>
          )}
        </div>
        <div className={`mt-3 text-3xl font-black tracking-tight ${style.accent}`}>{formatScore(player.score)}</div>
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Points</div>
        <RatingBadge rating={player.rating} />
        <div className="mt-4 flex w-full items-center justify-center gap-4 border-t border-black/5 pt-3 text-xs font-semibold text-gray-600 dark:border-white/10 dark:text-gray-300">
          <span>{formatTime(player.time_elapsed)}</span>
          <span className="h-1 w-1 rounded-full bg-current opacity-40" />
          <span>{formatAccuracy(player.accuracy)}</span>
        </div>
      </div>
    </article>
  );
}

function LeaderboardRow({ player, isCurrentUser }: { player: FirstAttemptLeaderboardEntry; isCurrentUser: boolean }) {
  return (
    <article
      className={`grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 px-3 py-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_6rem_6rem_5rem_5rem] sm:px-5 ${
        isCurrentUser
          ? 'rounded-2xl bg-purple-50 ring-2 ring-inset ring-purple-400 dark:bg-purple-950/30 dark:ring-purple-600'
          : 'border-b border-gray-100 last:border-b-0 dark:border-gray-800'
      }`}
    >
      <div className="text-center text-sm font-black text-gray-500 dark:text-gray-400">#{player.rank}</div>
      <div className="flex min-w-0 items-center gap-3">
        <PlayerAvatar player={player} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-bold text-gray-900 dark:text-white">{getPlayerName(player)}</h4>
            {isCurrentUser && (
              <span className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black uppercase text-purple-700 dark:bg-purple-900/60 dark:text-purple-200">
                You
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:hidden">
            <span>{formatTime(player.time_elapsed)}</span>
            <span>•</span>
            <span>{formatAccuracy(player.accuracy)}</span>
            <RatingBadge rating={player.rating} />
          </div>
        </div>
      </div>
      <div className="text-right text-lg font-black text-purple-700 dark:text-purple-300 sm:text-center">{formatScore(player.score)}</div>
      <div className="hidden text-center text-sm font-semibold text-gray-600 dark:text-gray-300 sm:block">{formatTime(player.time_elapsed)}</div>
      <div className="hidden text-center text-sm font-semibold text-gray-600 dark:text-gray-300 sm:block">{formatAccuracy(player.accuracy)}</div>
      <div className="hidden justify-center sm:flex"><RatingBadge rating={player.rating} /></div>
    </article>
  );
}

function YourFirstAttemptCard({ player }: { player: FirstAttemptLeaderboardEntry }) {
  return (
    <div className="mt-6 rounded-3xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500 p-[2px] shadow-lg shadow-purple-200/40 dark:shadow-none">
      <div className="rounded-[calc(1.5rem-2px)] bg-white p-5 dark:bg-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <PlayerAvatar player={player} />
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-purple-600 dark:text-purple-300">Your First Attempt</div>
              <div className="mt-1 text-lg font-black text-gray-900 dark:text-white">Rank #{player.rank}</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center sm:min-w-[390px]">
            <div><div className="text-lg font-black text-purple-700 dark:text-purple-300">{formatScore(player.score)}</div><div className="text-[10px] uppercase text-gray-500">Score</div></div>
            <div><div className="text-lg font-black text-gray-800 dark:text-gray-100">{formatTime(player.time_elapsed)}</div><div className="text-[10px] uppercase text-gray-500">Time</div></div>
            <div><div className="text-lg font-black text-gray-800 dark:text-gray-100">{formatAccuracy(player.accuracy)}</div><div className="text-[10px] uppercase text-gray-500">Accuracy</div></div>
            <div className="flex flex-col items-center"><RatingBadge rating={player.rating} /><div className="mt-1 text-[10px] uppercase text-gray-500">Rating</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-label="Loading first attempt leaderboard">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-64 rounded-3xl bg-gray-100 dark:bg-gray-800" />)}
      </div>
      <div className="h-36 rounded-2xl bg-gray-100 dark:bg-gray-800" />
    </div>
  );
}

export default function FirstAttemptLeaderboard({ levelSlug, currentUserId, refreshKey }: FirstAttemptLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<FirstAttemptLeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(
    () => getLevelFirstAttemptLeaderboard(levelSlug, currentUserId),
    [currentUserId, levelSlug]
  );

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await fetchLeaderboard();
    if (queryError || !data) {
      setError('The leaderboard could not be loaded. Please try again.');
    } else {
      setLeaderboard(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function refreshLeaderboard() {
      const { data, error: queryError } = await fetchLeaderboard();
      if (cancelled) return;

      if (queryError || !data) {
        setError('The leaderboard could not be loaded. Please try again.');
      } else {
        setLeaderboard(data);
        setError(null);
      }
      setLoading(false);
    }

    void refreshLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [fetchLeaderboard, refreshKey]);

  if (loading) return <LeaderboardSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
        <p className="font-semibold text-red-700 dark:text-red-300">{error}</p>
        <button onClick={() => void loadLeaderboard()} className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700">
          <RotateCw size={15} /> Retry
        </button>
      </div>
    );
  }

  if (!leaderboard) return null;

  const topThree = leaderboard.topTen.filter((player) => Number(player.rank) <= 3);
  const remaining = leaderboard.topTen.filter((player) => Number(player.rank) > 3);
  const showCurrentUserCard = leaderboard.currentUser && Number(leaderboard.currentUser.rank) > 10;

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 dark:border-purple-900/50 dark:from-purple-950/40 dark:to-fuchsia-950/20">
          <Users className="mb-3 text-purple-600 dark:text-purple-300" size={21} />
          <div className="text-2xl font-black text-gray-950 dark:text-white">{Number(leaderboard.stats.participant_count || 0).toLocaleString()}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">First-time Players</div>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:border-orange-900/50 dark:from-orange-950/40 dark:to-amber-950/20">
          <Trophy className="mb-3 text-orange-600 dark:text-orange-300" size={21} />
          <div className="text-2xl font-black text-gray-950 dark:text-white">{formatScore(leaderboard.stats.average_first_score)}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Average First Score</div>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 dark:border-sky-900/50 dark:from-sky-950/40 dark:to-indigo-950/20">
          <Timer className="mb-3 text-sky-600 dark:text-sky-300" size={21} />
          <div className="text-2xl font-black text-gray-950 dark:text-white">{formatTime(leaderboard.stats.average_first_time)}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Average First Time</div>
        </div>
      </div>

      <div>
        <div className="mb-7 text-center">
          <h3 className="text-2xl font-black text-gray-950 dark:text-white">First Attempt Leaderboard</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Only each signed-in player&apos;s first completed attempt counts.</p>
        </div>

        {leaderboard.topTen.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/60 px-6 py-12 text-center dark:border-orange-900/60 dark:bg-orange-950/20">
            <Trophy className="mx-auto text-orange-500" size={38} />
            <h4 className="mt-4 text-lg font-black text-gray-900 dark:text-white">Be the first on this leaderboard</h4>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {currentUserId ? 'Complete this game to record your first-attempt score.' : 'Sign in and complete this game to claim the first spot.'}
            </p>
          </div>
        ) : (
          <>
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 gap-4 pt-3 md:grid-cols-3 md:items-end md:gap-5">
                {topThree.map((player) => (
                  <PodiumCard key={player.user_id} player={player} isCurrentUser={player.user_id === currentUserId} />
                ))}
              </div>
            )}

            {remaining.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_6rem_6rem_5rem_5rem] gap-3 border-b border-gray-200 bg-gray-50 px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400 sm:grid">
                  <span>Rank</span><span className="text-left">Player</span><span>Score</span><span>Time</span><span>Accuracy</span><span>Rating</span>
                </div>
                <div className="p-2 sm:p-0">
                  {remaining.map((player) => (
                    <LeaderboardRow key={player.user_id} player={player} isCurrentUser={player.user_id === currentUserId} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {showCurrentUserCard && <YourFirstAttemptCard player={leaderboard.currentUser!} />}
      </div>
    </div>
  );
}
