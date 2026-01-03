import Link from 'next/link';
import Image from 'next/image';
import { getThemes } from '@/lib/db/themes';
import Pagination from '@/components/Pagination';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Themed Spot the Difference Games | Special Collections',
    description: 'Explore our special themed collections of spot the difference puzzles. From Christmas and Halloween to Ocean Adventures and Space Exploration. Challenge yourself with curated puzzle themes.',
    keywords: 'themed puzzles, special collections, spot the difference themes, holiday puzzles, seasonal games, Christmas puzzles, Halloween games, ocean puzzles, space puzzles',
    openGraph: {
        title: 'Themed Spot the Difference Games | Special Collections',
        description: 'Explore our special themed collections of spot the difference puzzles. From Christmas and Halloween to Ocean Adventures and Space Exploration.',
        type: 'website',
        images: ['/og-themes.jpg'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Themed Spot the Difference Games',
        description: 'Explore our special themed collections of spot the difference puzzles.',
        images: ['/og-themes.jpg'],
    },
};

interface ThemesPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function ThemesPage({ searchParams }: ThemesPageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;

    const { themes, total, page, pageSize, totalPages } = await getThemes(currentPage, 12);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Special Themes</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Explore our curated collection of themed spot-the-difference puzzles
                </p>
            </div>

            {themes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No themes available yet</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {themes.map((theme, index) => (
                            <Link
                                key={theme.id}
                                href={`/themes/${theme.slug}`}
                                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <Image
                                        src={theme.cover}
                                        alt={`${theme.title} theme collection`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading={index < 6 ? "eager" : "lazy"}
                                        priority={index < 6}
                                        quality={85}
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center gap-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                            {theme.easy_levels > 0 && (
                                                <span className="bg-green-600/80 px-2 py-1 rounded">
                                                    {theme.easy_levels} Easy
                                                </span>
                                            )}
                                            {theme.hard_levels > 0 && (
                                                <span className="bg-yellow-600/80 px-2 py-1 rounded">
                                                    {theme.hard_levels} Hard
                                                </span>
                                            )}
                                            {theme.expert_levels > 0 && (
                                                <span className="bg-red-600/80 px-2 py-1 rounded">
                                                    {theme.expert_levels} Expert
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {theme.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                        {theme.description || 'A collection of themed spot-the-difference puzzles'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                                            {theme.level_count} {theme.level_count === 1 ? 'Puzzle' : 'Puzzles'}
                                        </span>
                                        {theme.total_plays > 0 && (
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                {theme.total_plays.toLocaleString()} plays
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        total={total}
                        pageSize={pageSize}
                        basePath="/themes"
                    />
                </>
            )}
        </div>
    );
}