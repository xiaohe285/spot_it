import Link from 'next/link';
import { levels } from '@/data/levels';

export default function GamesPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">All Games</h1>

            <div className="flex flex-wrap gap-4 mb-12">
                {[
                    { name: 'For Adults', href: '/games/adults', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300' },
                    { name: 'For Kids', href: '/games/kids', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300' },
                    { name: 'Special Themes', href: '/games/themes', color: 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300' },
                    { name: 'By Difficulty', href: '/games/difficulty', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300' },
                ].map((cat) => (
                    <Link
                        key={cat.name}
                        href={cat.href}
                        className={`px-6 py-3 rounded-full font-bold transition-colors ${cat.color}`}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {levels.map((level) => (
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
                            <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider font-semibold">{level.category}</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">{level.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Find {level.differences.length} differences</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
