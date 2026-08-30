'use client';

import { useCallback, useEffect, useState } from 'react';
import { Award, Flame, History, Medal, RefreshCw, Sparkles, Trophy } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { getUserXpDashboard, type UserXpDashboard } from '@/lib/gameRecords';
import { getXpBonusLabel, XP_UPDATED_EVENT } from '@/lib/xp';

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export default function ProgressClient() {
  const { user, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<UserXpDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchDashboard = useCallback(async () => {
    if (!user) return { data: null, error: null };
    return getUserXpDashboard(user.id);
  }, [user]);

  const reload = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchDashboard();
    if (result.error || !result.data) {
      setError('Your XP progress could not be loaded.');
    } else {
      setDashboard(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      if (authLoading) return;
      if (!user) {
        setLoading(false);
        return;
      }

      const result = await fetchDashboard();
      if (cancelled) return;
      if (result.error || !result.data) {
        setError('Your XP progress could not be loaded.');
      } else {
        setDashboard(result.data);
        setError(null);
      }
      setLoading(false);
    }

    function handleXpUpdated() {
      void loadDashboard();
    }

    void loadDashboard();
    window.addEventListener(XP_UPDATED_EVENT, handleXpUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(XP_UPDATED_EVENT, handleXpUpdated);
    };
  }, [authLoading, fetchDashboard, user]);

  if (authLoading || loading) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="mx-auto h-10 w-64 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-72 rounded-3xl bg-gray-100 dark:bg-gray-800" />
          <div className="grid gap-6 md:grid-cols-2"><div className="h-80 rounded-3xl bg-gray-100 dark:bg-gray-800" /><div className="h-80 rounded-3xl bg-gray-100 dark:bg-gray-800" /></div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
        <div className="w-full rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-orange-50 p-10 text-center shadow-xl dark:border-purple-900/60 dark:from-purple-950/40 dark:to-orange-950/30">
          <Sparkles className="mx-auto text-purple-600 dark:text-purple-300" size={48} />
          <h1 className="mt-5 text-3xl font-black text-gray-950 dark:text-white">Your XP Journey</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">Sign in to earn XP, level up, unlock achievements, and review your complete XP history.</p>
          <button onClick={() => setShowAuthModal(true)} className="mt-7 rounded-full bg-gradient-to-r from-purple-600 to-orange-500 px-7 py-3 font-black text-white shadow-lg transition hover:scale-105">
            Sign In to Continue
          </button>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
        <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/30">
          <p className="font-bold text-red-700 dark:text-red-300">{error || 'XP progress is unavailable.'}</p>
          <button onClick={() => void reload()} className="mt-5 inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 font-bold text-white">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </main>
    );
  }

  const { progress, recentLedger, recentAchievements } = dashboard;
  const percentage = Math.min(100, Math.max(0, Number(progress.xp_into_level) / Math.max(1, Number(progress.xp_span)) * 100));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-black text-purple-700 dark:bg-purple-950/60 dark:text-purple-200"><Sparkles size={17} /> Lifetime Progress</div>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 dark:text-white sm:text-5xl">Level {progress.current_level}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Every completed puzzle moves your journey forward.</p>
      </div>

      <section className="mt-9 overflow-hidden rounded-[2rem] border border-purple-200 bg-gradient-to-br from-purple-600 via-fuchsia-600 to-orange-500 p-1 shadow-2xl shadow-purple-200/40 dark:border-purple-700 dark:shadow-none">
        <div className="rounded-[calc(2rem-4px)] bg-white/95 p-6 backdrop-blur dark:bg-gray-950/90 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300">Total Experience</div>
              <div className="mt-2 text-5xl font-black tracking-tight text-gray-950 dark:text-white">{Number(progress.total_xp).toLocaleString()} <span className="text-2xl text-purple-600 dark:text-purple-300">XP</span></div>
            </div>
            <div className="text-left sm:text-right"><div className="text-2xl font-black text-gray-900 dark:text-white">Level {progress.current_level + 1}</div><div className="text-sm text-gray-500">{Number(progress.xp_to_next_level).toLocaleString()} XP remaining</div></div>
          </div>
          <div className="mt-7 h-5 overflow-hidden rounded-full bg-purple-100 p-1 dark:bg-purple-950">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-500 transition-all" style={{ width: `${percentage}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400"><span>{Number(progress.xp_into_level).toLocaleString()} XP this level</span><span>{Number(progress.xp_span).toLocaleString()} XP needed</span></div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Trophy, value: progress.achievements_count, label: 'Achievements', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
          { icon: Medal, value: progress.unique_badges_count, label: 'Unique Badges', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
          { icon: Flame, value: progress.current_streak, label: 'Current Streak', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
          { icon: Award, value: progress.longest_streak, label: 'Longest Streak', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className={`rounded-2xl p-4 ${color}`}><Icon size={22} /><div className="mt-3 text-2xl font-black text-gray-950 dark:text-white">{Number(value).toLocaleString()}</div><div className="text-xs font-bold uppercase tracking-wider opacity-75">{label}</div></div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-black text-gray-950 dark:text-white"><Trophy className="text-amber-500" size={22} /> Recent Achievements</h2>
          <div className="mt-5 space-y-3">
            {recentAchievements.length === 0 ? <p className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500 dark:bg-gray-800">Complete a puzzle to unlock your first achievement.</p> : recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-950/30 dark:to-orange-950/20">
                <div className="min-w-0"><div className="truncate font-black text-gray-900 capitalize dark:text-white">{getXpBonusLabel(achievement.achievement_key)}</div><div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(achievement.unlocked_at)}</div></div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-amber-700 shadow-sm dark:bg-black/20 dark:text-amber-200">+{achievement.xp_awarded} XP</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-black text-gray-950 dark:text-white"><History className="text-purple-500" size={22} /> XP History</h2>
          <div className="mt-5 space-y-3">
            {recentLedger.length === 0 ? <p className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500 dark:bg-gray-800">Your XP transactions will appear here.</p> : recentLedger.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0 dark:border-gray-800">
                <div className="min-w-0"><div className="truncate font-bold text-gray-900 dark:text-white">{entry.reason}</div><div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(entry.created_at)} · Balance {Number(entry.balance_after).toLocaleString()}</div></div>
                <span className="shrink-0 text-lg font-black text-purple-600 dark:text-purple-300">+{entry.amount}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
