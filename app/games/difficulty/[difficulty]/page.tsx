import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getLevelsByDifficultyPaginated } from '@/lib/levels';
import Pagination from '@/components/Pagination';
import Breadcrumb from '@/components/ui/Breadcrumb';

const siteUrl = 'https://spotdiffs.com';

const VALID_DIFFICULTIES = ['easy', 'hard', 'expert'] as const;
type DifficultySlug = typeof VALID_DIFFICULTIES[number];

const difficultyMap: Record<DifficultySlug, 'Easy' | 'Hard' | 'Expert'> = {
  easy: 'Easy',
  hard: 'Hard',
  expert: 'Expert',
};

const difficultyColors: Record<'Easy' | 'Hard' | 'Expert', string> = {
  Easy: 'bg-green-500',
  Hard: 'bg-orange-500',
  Expert: 'bg-red-600',
};

interface DifficultyPageProps {
  params: Promise<{ difficulty: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ difficulty: string }> }): Promise<Metadata> {
  const { difficulty: slug } = await params;
  const difficulty = difficultyMap[slug as DifficultySlug];

  if (!difficulty) {
    return {
      title: 'Difficulty Not Found',
    };
  }

  const titleMap = {
    Easy: 'Spot the Difference Easy - Simple & Fun Puzzle Games',
    Hard: 'Spot the Difference Hard - Difficult & Challenging Puzzles',
    Expert: 'Hardest Spot the Difference - Expert Level Puzzles'
  };

  const descriptionMap = {
    Easy: 'Play easy spot the difference games perfect for beginners and casual players. Simple puzzles with clear differences to find. Start your puzzle journey today!',
    Hard: 'Challenge yourself with hard spot the difference puzzles. Difficult games designed for players seeking more complex visual challenges. Test your observation skills!',
    Expert: 'Take on the hardest spot the difference challenges available. Expert level puzzles for master puzzle solvers. Can you find all the hidden differences?'
  };

  return {
    title: titleMap[difficulty],
    description: descriptionMap[difficulty],
    openGraph: {
      title: titleMap[difficulty],
      description: descriptionMap[difficulty],
      url: `${siteUrl}/games/difficulty/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: titleMap[difficulty],
      description: descriptionMap[difficulty],
    },
    alternates: {
      canonical: `${siteUrl}/games/difficulty/${slug}`,
    },
  };
}

export default async function DifficultyPage({ params, searchParams }: DifficultyPageProps) {
  const { difficulty: slug } = await params;
  const { page: pageParam } = await searchParams;

  // Validate difficulty
  if (!VALID_DIFFICULTIES.includes(slug as DifficultySlug)) {
    notFound();
  }

  const difficulty = difficultyMap[slug as DifficultySlug];
  const currentPage = Number(pageParam) || 1;

  // Fetch paginated levels
  const { data, error, total, page, pageSize, totalPages } = await getLevelsByDifficultyPaginated(
    difficulty,
    currentPage,
    24
  );

  if (error) {
    console.error('Error fetching levels:', error);
  }

  const levels = data || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumb 
        items={[
          { label: 'All Games', href: '/games' },
          { label: 'Difficulty', href: '/games/difficulty' },
          { label: difficulty }
        ]}
        className="mb-6"
      />

      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {difficulty} Difficulty
        </h1>
        <span className={`text-sm px-4 py-2 rounded-full text-white ${difficultyColors[difficulty]}`}>
          {total} {total === 1 ? 'Game' : 'Games'}
        </span>
      </div>

      {levels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No {difficulty.toLowerCase()} games available yet.
          </p>
          <Link
            href="/games/difficulty"
            className="mt-4 inline-block text-purple-600 hover:text-purple-700 font-semibold"
          >
            Browse other difficulties →
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
                    alt={level.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {level.category_name && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-purple-600">
                      {level.category_name}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">
                    {level.title}
                  </h3>
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
            basePath={`/games/difficulty/${slug}`}
          />
        </>
      )}
    </div>
  );
}
