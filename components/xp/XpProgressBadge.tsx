'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserXpProgress, type UserXpProgress } from '@/lib/gameRecords';
import { XP_UPDATED_EVENT } from '@/lib/xp';

export default function XpProgressBadge() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserXpProgress | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) return null;
    const { data } = await getUserXpProgress(user.id);
    return data;
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      const data = await fetchProgress();
      if (!cancelled) setProgress(data);
    }

    function handleXpUpdated(event: Event) {
      const detail = (event as CustomEvent<UserXpProgress | null>).detail;
      if (detail) {
        setProgress(detail);
      } else {
        void loadProgress();
      }
    }

    void loadProgress();
    window.addEventListener(XP_UPDATED_EVENT, handleXpUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(XP_UPDATED_EVENT, handleXpUpdated);
    };
  }, [fetchProgress]);

  if (!user || !progress) return null;

  const percentage = Math.min(100, Math.max(0, (Number(progress.xp_into_level) / Math.max(1, Number(progress.xp_span))) * 100));

  return (
    <Link
      href="/progress"
      className="hidden min-w-28 rounded-xl border border-purple-100 bg-purple-50/80 px-2.5 py-1.5 transition hover:border-purple-300 hover:bg-purple-100 sm:block dark:border-purple-900/60 dark:bg-purple-950/40 dark:hover:border-purple-700"
      aria-label={`Level ${progress.current_level}, ${progress.xp_to_next_level} XP to next level`}
    >
      <div className="flex items-center justify-between gap-2 text-[11px] font-black text-purple-700 dark:text-purple-200">
        <span className="inline-flex items-center gap-1"><Sparkles size={12} /> LV {progress.current_level}</span>
        <span>{Number(progress.total_xp).toLocaleString()} XP</span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-purple-200 dark:bg-purple-900">
        <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-orange-500" style={{ width: `${percentage}%` }} />
      </div>
    </Link>
  );
}
