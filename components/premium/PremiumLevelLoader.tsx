'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { LevelWithCategory } from '@/lib/levels';
import { isPremiumLevelContent, type PremiumLevelContent } from '@/lib/premium/levelContent';
import { usePremium } from '@/contexts/PremiumContext';

// The caller keys this component by identity and level, and unmounts it when access ends.
export default function PremiumLevelLoader({ level, children }: {
  level: LevelWithCategory;
  children: (level: LevelWithCategory) => ReactNode;
}) {
  const { refresh } = usePremium();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    attempt: number;
    content?: PremiumLevelContent;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/premium/levels/${encodeURIComponent(level.slug)}`, {
          cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) {
          if (!cancelled && (response.status === 401 || response.status === 403)) void refresh();
          throw new Error('Unable to load this Premium puzzle. Please retry.');
        }
        const content: unknown = await response.json();
        if (!isPremiumLevelContent(content, level)) throw new Error('This puzzle is not ready. Please retry later.');
        if (!cancelled) setResult({ attempt, content });
      } catch (error) {
        if (!cancelled) setResult({ attempt, error: (error as Error).message });
      }
    }
    void load();
    return () => { cancelled = true; controller.abort(); };
  }, [level, attempt, refresh]);

  if (result?.attempt !== attempt) return <p role="status" className="p-8 text-center">Loading Premium puzzle…</p>;
  if (!result.content) return <div role="alert" className="p-8 text-center">
    <p>{result.error}</p>
    <button onClick={() => setAttempt(value => value + 1)} className="mt-3 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white">Retry</button>
  </div>;
  return children({
    ...level,
    image_url_1: result.content.image_url_1,
    image_url_2: result.content.image_url_2 ?? undefined,
    differences: result.content.differences,
  });
}
