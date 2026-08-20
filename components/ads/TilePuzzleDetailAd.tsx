'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export default function TilePuzzleDetailAd() {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      initializedRef.current = true;
    } catch (error) {
      console.warn('Unable to initialize tile puzzle ad:', error);
    }
  }, []);

  return (
    <aside
      aria-label="Advertisement"
      className="flex min-h-[250px] w-full flex-col overflow-hidden rounded-3xl border border-white/90 bg-white/70 p-2 shadow-sm shadow-indigo-950/5 backdrop-blur lg:h-full lg:min-h-0 dark:border-white/10 dark:bg-white/[0.04]"
    >
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
        
      </p>
      <ins
        className="adsbygoogle min-h-[240px] w-full flex-1 lg:min-h-0"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3161682431818340"
        data-ad-slot="7180202151"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
