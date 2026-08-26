import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getThemeBySlug, getLevelsByThemeId } from '@/lib/db/themes';
import Pagination from '@/components/Pagination';
import { Metadata } from 'next';

interface ThemeDetailPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const theme = await getThemeBySlug(slug);

    if (!theme) {
        return {
            title: 'Theme Not Found',
            description: 'The requested theme could not be found.',
        };
    }

    // Use theme's SEO fields if available, otherwise use theme title and description
    const title = theme.seo_title || `${theme.title} - Spot the Difference Games Collection`;
    const description = theme.seo_description || theme.description || `Explore ${theme.title} themed spot the difference puzzles. ${theme.level_count} challenging puzzles across easy, medium, hard, and expert levels.`;

    return {
        title,
        description,
        keywords: `${theme.title}, themed puzzles, spot the difference, ${theme.title.toLowerCase()} games, puzzle collection, find differences`,
        openGraph: {
            title,
            description,
            type: 'website',
            images: [theme.cover],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [theme.cover],
        },
    };
}

export default async function ThemeDetailPage({ params, searchParams }: ThemeDetailPageProps) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const searchParamsData = await searchParams;
    const currentPage = Number(searchParamsData.page) || 1;

    // Fetch theme data
    const theme = await getThemeBySlug(slug);

    if (!theme) {
        notFound();
    }

    // Fetch levels for this theme
    const { levels, total, page, pageSize, totalPages } = await getLevelsByThemeId(theme.id, currentPage, 24);

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Theme Header */}
            <div className="mb-12">
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
                    <Image
                        src={theme.cover}
                        alt={`${theme.title} theme`}
                        fill
                        className="object-cover"
                        priority
                        quality={90}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                            {theme.title}
                        </h1>
                        {theme.description && (
                            <p className="text-white/90 text-lg max-w-3xl">
                                {theme.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Breadcrumb Navigation */}
                <nav className="flex items-center gap-2 text-sm mb-6">
                    <Link href="/themes" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        Themes
                    </Link>
                    <span className="text-gray-400 dark:text-gray-600">/</span>
                    <span className="text-gray-900 dark:text-gray-200 font-medium">{theme.title}</span>
                </nav>

                {/* Stats Bar */}
                <div className="flex flex-wrap gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {theme.level_count}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300">
                            {theme.level_count === 1 ? 'Puzzle' : 'Puzzles'}
                        </span>
                    </div>
                    {theme.easy_levels > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-bold">
                                {theme.easy_levels} Easy
                            </span>
                        </div>
                    )}
                    {theme.medium_levels > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full text-sm font-bold">
                                {theme.medium_levels} Medium
                            </span>
                        </div>
                    )}
                    {theme.hard_levels > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-bold">
                                {theme.hard_levels} Hard
                            </span>
                        </div>
                    )}
                    {theme.expert_levels > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm font-bold">
                                {theme.expert_levels} Expert
                            </span>
                        </div>
                    )}
                    {theme.total_plays > 0 && (
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-gray-500 dark:text-gray-400">
                                {theme.total_plays.toLocaleString()} total plays
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Levels Grid */}
            {levels.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No puzzles available for this theme yet</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        total={total}
                        pageSize={pageSize}
                        basePath={`/themes/${slug}`}
                    />
                </>
            )}
        </div>
    );
}
