'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { usePremium } from '@/contexts/PremiumContext';
import { trackPremium } from '@/lib/premium/analytics';
import type { LevelWithCategory } from '@/lib/levels';

export default function PremiumGameGate({ level, children }: { level: LevelWithCategory; children: React.ReactNode }) {
  const { status, loading, error, refresh } = usePremium();
  useEffect(() => {
    if (level.is_premium && !loading && !status.active && !error) trackPremium('premium_locked_view', { level_slug: level.slug });
  }, [level.is_premium, level.slug, loading, status.active, error]);
  if (!level.is_premium || (!loading && !error && status.active)) return children;
  return <div className="w-full">
    <div className={`mx-auto flex w-full max-w-6xl flex-col gap-1 ${level.mode !== 'single' && level.image_url_2 ? 'md:flex-row' : ''}`}>
      {[level.image_url_1, ...(level.mode !== 'single' && level.image_url_2 ? [level.image_url_2] : [])].map((src, index) => <div key={index} className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
        <Image src={src} alt={`${level.title} — Premium preview ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain" />
        <div className="absolute inset-0 flex items-center justify-center"><span className="rounded-2xl border border-white/50 bg-white/50 p-3 shadow-sm backdrop-blur-sm"><LockKeyhole className="h-10 w-10 text-slate-800/70" aria-hidden="true" /></span></div>
      </div>)}
    </div>
    <div className="mx-auto max-w-xl p-6 text-center" aria-live="polite">
      {loading ? <p>Checking Premium access…</p> : error ? <><p>{error}</p><button onClick={() => void refresh()} className="mt-3 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Retry</button></> : <>
        <p className="font-bold text-slate-900 dark:text-white">Unlock this puzzle with Premium</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Every Premium puzzle, ad-free play, and 10 printable packs each month.</p>
        <Link href={`/premium?source=game&level=${encodeURIComponent(level.slug)}`} className="mt-4 inline-block rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-bold text-white">Unlock with Premium</Link>
        <Link href="/games?access=free" className="mt-3 block text-sm font-semibold text-slate-600 underline dark:text-slate-300">Browse free games</Link>
      </>}
    </div>
  </div>;
}
