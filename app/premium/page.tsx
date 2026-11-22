import type { Metadata } from 'next';
import { getLevels } from '@/lib/db/levels';
import { getPrintableCatalog } from '@/lib/db/printables';
import { waffoEnvironment } from '@/lib/waffo/server';
import PremiumExperience from '@/components/premium/PremiumExperience';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Premium — More puzzles, no interruptions',
  description: 'Unlock every Premium puzzle, play ad-free, and enjoy 10 printable packs each month. From $9 monthly, $24 quarterly or $90 annually.',
  alternates: { canonical: '/premium' },
};
export default async function PremiumPage({ searchParams }: { searchParams: Promise<{ source?: string; level?: string }> }) {
  const params = await searchParams;
  const [games, catalog] = await Promise.allSettled([getLevels(1, 6, 'premium'), getPrintableCatalog()]);
  return <PremiumExperience testMode={waffoEnvironment() === 'test'}
    source={(params.source || 'direct').slice(0, 100)} levelSlug={(params.level || '').slice(0, 200)}
    games={games.status === 'fulfilled' ? games.value.levels : []}
    products={catalog.status === 'fulfilled' ? catalog.value.products.filter(product => product.isPremiumIncluded && product.priceCents > 0).slice(0, 3) : []}
  />;
}
