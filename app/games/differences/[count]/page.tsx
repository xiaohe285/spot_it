import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getDifferenceCountStats,
  getLevelsByDifferenceCountPaginated,
} from '@/lib/levels';
import Pagination from '@/components/Pagination';
import Breadcrumb from '@/components/ui/Breadcrumb';

const siteUrl = 'https://spotdiffs.com';

interface DifferencesCountPageProps {
  params: Promise<{ count: string }>;
  searchParams: Promise<{ page?: string }>;
}

function parseCount(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 50) return null;
  return n;
}

export async function generateStaticParams() {
  const { data } = await getDifferenceCountStats();
  return (data || []).map((group) => ({ count: String(group.count) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ count: string }>;
}): Promise<Metadata> {
  const { count: raw } = await params;
  const count = parseCount(raw);

  if (count === null) {
    return { title: 'Differences Not Found' };
  }

  const title = `Spot the Difference ${count} Differences - Find All ${count} Spots`;
  const description = `Play spot the difference games with exactly ${count} differences. Find all ${count} hidden differences in these carefully curated visual puzzles. Free online — no download required.`;

  return {
    title,
    description,
    keywords: `spot the difference ${count} differences, find ${count} differences, ${count} difference games, ${count} differences puzzle`,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/games/differences/${count}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/games/differences/${count}`,
    },
  };
}

export default async function DifferencesCountPage({
  params,
  searchParams,
}: DifferencesCountPageProps) {
  const { count: raw } = await params;
  const { page: pageParam } = await searchParams;
  const count = parseCount(raw);

  if (count === null) {
    notFound();
  }

  const currentPage = Number(pageParam) || 1;
  const { data, error, total, page, pageSize, totalPages } =
    await getLevelsByDifferenceCountPaginated(count, currentPage, 24);

  if (error) {
    console.error('Error fetching levels by difference count:', error);
  }

  const levels = data || [];

  // If this count has no games at all, 404
  if (total === 0 && currentPage === 1) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumb
        items={[
          { label: 'All Games', href: '/games' },
          { label: 'By Differences', href: '/games/differences' },
          { label: `${count} Differences` },
        ]}
        className="mb-6"
      />

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {count} Differences Games
        </h1>
        <span className="text-sm px-4 py-2 rounded-full text-white bg-gradient-to-r from-orange-500 to-pink-500">
          {total} {total === 1 ? 'Game' : 'Games'}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-3xl">
        Every puzzle on this page has exactly {count} differences to find. Click a
        game to start spotting!
      </p>

      {levels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No games with {count} differences on this page.
          </p>
          <Link
            href="/games/differences"
            className="mt-4 inline-block text-purple-600 hover:text-purple-700 font-semibold"
          >
            Browse other difference counts →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {levels.map((level) => (
              <Link
                key={level.id}
                href={`/game/${level.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={level.image_url_1}
                    alt={`${level.title} - Find ${count} differences`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm ${
                      level.difficulty === 'Easy'
                        ? 'bg-green-500'
                        : level.difficulty === 'Hard'
                          ? 'bg-orange-500'
                          : 'bg-red-600'
                    }`}
                  >
                    {level.difficulty}
                  </div>
                </div>
                <div className="p-6">
                  {level.category_name && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-semibold">
                      {level.category_name}
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">
                    {level.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Find {level.differences.length} differences
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            basePath={`/games/differences/${count}`}
          />
        </>
      )}
    </div>
  );
}
