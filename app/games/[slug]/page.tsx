import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCategoryBySlug, getLevelsByCategoryPaginated } from '@/lib/levels';
import Pagination from '@/components/Pagination';

const siteUrl = 'https://spotdiffs.com';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  const title = category.seo_title || `${category.name} - Spot the Difference Games`;
  const description = category.seo_description ||
    `Play ${category.name.toLowerCase()} spot the difference games. ${category.description || 'Find differences and test your observation skills!'}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/games/${category.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${siteUrl}/games/${category.slug}`,
    },
  };
}

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const { page } = await searchParams;
    const currentPage = Number(page) || 1;

    const { data: category, error: categoryError } = await getCategoryBySlug(slug);
    const { data: categoryLevels, error: levelsError, total, pageSize, totalPages } = await getLevelsByCategoryPaginated(slug, currentPage, 24);

    if (categoryError || !category) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center py-20">
                    <p className="text-xl text-gray-500 dark:text-gray-400">Category not found.</p>
                    <Link href="/games" className="text-purple-600 font-semibold mt-4 inline-block hover:underline">
                        Browse all games
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/games" className="text-gray-500 hover:text-purple-600 dark:text-gray-400">← All Games</Link>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    {category.icon && <span className="mr-2">{category.icon}</span>}
                    {category.name}
                </h1>
            </div>

            {category.description && (
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl">
                    {category.description}
                </p>
            )}

            {categoryLevels && categoryLevels.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categoryLevels.map((level, index) => (
                            <Link
                                key={level.id}
                                href={`/game/${level.slug}`}
                                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <Image
                                        src={level.image_url_1}
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
                                    {level.featured && (
                                        <div className="absolute top-4 left-4">
                                            <span className="text-2xl">⭐</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-semibold">{category.name}</div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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
                        currentPage={currentPage}
                        totalPages={totalPages}
                        total={total}
                        pageSize={pageSize}
                        basePath={`/games/${slug}`}
                    />
                </>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-500 dark:text-gray-400">No games found in this category yet.</p>
                    <Link href="/games" className="text-purple-600 font-semibold mt-4 inline-block hover:underline">
                        Browse all games
                    </Link>
                </div>
            )}
        </div>
    );
}
