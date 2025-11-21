import { use } from 'react';
import Link from 'next/link';
import { levels } from '@/data/levels';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    // Normalize slug to match category format (e.g., "adults" -> "Adults")
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
    const categoryLevels = levels.filter(l => l.category.toLowerCase() === slug.toLowerCase());

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/games" className="text-gray-500 hover:text-purple-600">← All Games</Link>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{categoryName} Games</h1>
            </div>

            {categoryLevels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryLevels.map((level) => (
                        <Link
                            key={level.id}
                            href={`/game/${level.slug}`}
                            className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={level.imageUrl1}
                                    alt={level.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-purple-600">
                                    {level.difficulty}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">{level.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">Find {level.differences.length} differences</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-xl text-gray-500">No games found in this category yet.</p>
                    <Link href="/games" className="text-purple-600 font-semibold mt-4 inline-block hover:underline">
                        Browse all games
                    </Link>
                </div>
            )}
        </div>
    );
}
