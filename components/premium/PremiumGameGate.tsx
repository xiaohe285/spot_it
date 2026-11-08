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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/30 p-4 text-center backdrop-blur-sm transition-colors duration-300 has-[a[data-premium-unlock]:hover]:bg-slate-950/15" aria-live="polite">
          {loading ? <p className="font-semibold text-white">Checking Premium access…</p> : error ? <>
            <p className="text-white">{error}</p>
            <button onClick={() => void refresh()} className="mt-3 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Retry</button>
          </> : <>
            <Link data-premium-unlock href={`/premium?source=game&level=${encodeURIComponent(level.slug)}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-3 font-bold text-white shadow-lg transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <LockKeyhole className="h-5 w-5 shrink-0" aria-hidden="true" />
              Unlock with Premium
            </Link>
            <Link href="/games?access=free" className="mt-4 text-sm font-semibold text-white underline underline-offset-4 hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Browse free games</Link>
          </>}
        </div>
      </div>)}
    </div>
  </div>;
}
