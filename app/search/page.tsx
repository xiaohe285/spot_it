import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { searchLevels } from '@/lib/db/levels';
import { Level } from '@/types';
import Pagination from '@/components/Pagination';
import SearchBox from '@/components/SearchBox';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q || '';

  if (query) {
    return {
      title: `Search Results for "${query}" - Spot the Difference`,
      description: `Find spot-the-difference games matching "${query}". Browse through our collection of visual puzzles and brain training games.`,
      openGraph: {
        title: `Search: ${query} - Spot the Difference`,
        description: `Search results for "${query}" in our collection of spot-the-difference games.`,
        url: `https://spotdiffs.com/search?q=${encodeURIComponent(query)}`,
        type: 'website',
      },
      robots: {
        index: false, // Don't index search result pages
        follow: true,
      },
    };
  }

  return {
    title: 'Search Games - Spot the Difference',
    description: 'Search through our collection of spot-the-difference games. Find puzzles by title, theme, or description.',
    openGraph: {
      title: 'Search Games - Spot the Difference',
      description: 'Search our collection of visual puzzle games.',
      url: 'https://spotdiffs.com/search',
      type: 'website',
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || '';
  const currentPage = Number(params.page) || 1;

  let levels: Level[] = [];
  let total = 0;
  let page = currentPage;
  let pageSize = 24;
  let totalPages = 0;

  // Only search if there's a query
  if (query) {
    const searchResults = await searchLevels(query, currentPage, 24);
    levels = searchResults.levels;
    total = searchResults.total;
    page = searchResults.page;
    pageSize = searchResults.pageSize;
    totalPages = searchResults.totalPages;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="relative inline-block">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent italic transform -skew-x-6">
            Search Games
          </h1>
          {/* Sparkles */}
          <div className="absolute -top-6 -left-8 text-orange-300 animate-pulse">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
          </div>
          <div className="absolute -bottom-2 -right-8 text-pink-300 animate-pulse delay-75">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg mt-4">
          Find your favorite spot-the-difference puzzles
        </p>
      </div>

      {/* Search Box */}
      <div className="mb-12">
        <SearchBox initialQuery={query} />
      </div>

      {/* Results or Empty State */}
      {!query ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            Enter a search term to find games
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Try searching for themes, categories, or specific titles
          </p>
        </div>
      ) : levels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            No games found for &quot;<strong>{query}</strong>&quot;
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-lg mb-6">
            Try different keywords or{' '}
            <Link href="/games" className="text-purple-600 hover:underline">
              browse all games
            </Link>
          </p>
        </div>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Found <strong className="text-gray-900 dark:text-white">{total}</strong> game{total !== 1 ? 's' : ''} matching &quot;<strong className="text-purple-600 dark:text-purple-400">{query}</strong>&quot;
            </p>
          </div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {levels.map((level, index) => (
              <Link
                key={level.id}
                href={`/game/${level.slug}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={level.imageUrl1}
                    alt={`${level.title} - Find the difference puzzle`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading={index < 6 ? "eager" : "lazy"}
                    priority={index < 6}
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-purple-600 dark:text-purple-300 shadow-sm">
                    {level.difficulty}
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-semibold">{level.category}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{level.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Find {level.differences.length} differences</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            basePath={`/search?q=${encodeURIComponent(query)}`}
          />
        </>
      )}
    </div>
  );
}
