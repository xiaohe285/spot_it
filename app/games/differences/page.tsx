import { Metadata } from 'next';
import Link from 'next/link';
import { getDifferenceCountStats } from '@/lib/levels';
import Breadcrumb from '@/components/ui/Breadcrumb';
import DifferenceCountCard from '@/components/games/DifferenceCountCard';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
  title: 'Games by Differences Count - Spot the Difference Puzzles',
  description:
    'Browse spot the difference games by number of differences. Play puzzles with 3, 5, 6, or more differences to find. Filter by exact difference count.',
  keywords:
    'spot the difference 5 differences, 3 differences games, 6 differences puzzle, find the differences by count, spot difference games',
  openGraph: {
    title: 'Games by Differences Count - Spot the Difference',
    description:
      'Browse spot the difference games by number of differences. Choose puzzles with exactly 3, 5, 6, or more differences.',
    url: `${siteUrl}/games/differences`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Games by Differences Count - Spot the Difference',
    description: 'Browse spot the difference games by number of differences.',
  },
  alternates: {
    canonical: `${siteUrl}/games/differences`,
  },
};

export default async function DifferencesHubPage() {
  const { data: groups, error } = await getDifferenceCountStats();

  if (error) {
    console.error('Error fetching difference count stats:', error);
  }

  const stats = groups || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumb
        items={[
          { label: 'All Games', href: '/games' },
          { label: 'By Differences' },
        ]}
        className="mb-6"
      />

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Games by Differences
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl">
          Prefer a set number of differences? Browse puzzles grouped by how many
          spots you need to find — from quick 3-difference games to denser challenges.
        </p>
      </div>

      {stats.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No difference-count categories available yet.
          </p>
          <Link
            href="/games"
            className="mt-4 inline-block text-purple-600 hover:text-purple-700 font-semibold"
          >
            Browse all games →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((group) => (
            <DifferenceCountCard key={group.count} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
