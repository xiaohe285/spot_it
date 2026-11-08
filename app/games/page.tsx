import PremiumRibbon from '@/components/premium/PremiumRibbon';
import Link from 'next/link';
import Image from 'next/image';
import { getLevels } from '@/lib/db/levels';
import Pagination from '@/components/Pagination';

interface GamesPageProps {
    searchParams: Promise<{ page?: string; access?: string }>;
}

export default async function GamesPage({ searchParams }: GamesPageProps) {
    const params = await searchParams;
    const currentPage = Math.max(1, Math.floor(Number(params.page)) || 1);
    const access = params.access === 'free' || params.access === 'premium' ? params.access : 'all';

    const { levels, total, page, pageSize, totalPages } = await getLevels(currentPage, 24, access);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">All Games</h1>

            <div className="flex flex-wrap gap-4 mb-12">
                {[
                    { name: 'Special Themes', href: '/themes', color: 'bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300' },
                    { name: 'By Difficulty', href: '/games/difficulty', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300' },
                    { name: 'By Differences', href: '/games/differences', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300' },
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

            <nav aria-label="Game access" className="mb-8 flex flex-wrap items-center gap-2">
                {(['all', 'free', 'premium'] as const).map(value => <Link key={value} href={value === 'all' ? '/games' : `/games?access=${value}`} aria-current={access === value ? 'page' : undefined} className={`rounded-full px-5 py-2.5 font-bold capitalize transition ${access === value ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{value}</Link>)}
                <Link href="/premium?source=games" className="ml-auto font-bold text-amber-700 dark:text-amber-300">Explore Premium →</Link>
            </nav>
            {levels.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No games match this filter.</p><Link href="/games" className="mt-3 inline-block font-bold text-orange-600">Browse all games</Link>
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
                                <div className="relative h-64 md:h-72 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <PremiumRibbon premium={level.isPremium} />
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
                                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-purple-600 dark:text-purple-300 shadow-sm">
                                        {level.differences.length} differences
                                    </div>
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm ${
                                        level.difficulty === 'Easy'
                                            ? 'bg-green-500'
                                            : level.difficulty === 'Hard'
                                                ? 'bg-orange-500'
                                                : 'bg-red-600'
                                    }`}>
                                        {level.difficulty}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm leading-tight text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-semibold">{level.category}</div>
                                    <h3 className="text-xl leading-snug font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{level.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        total={total}
                        pageSize={pageSize}
                        basePath="/games"
                        queryParams={access === 'all' ? {} : { access }}
                    />
                </>
            )}
        </div>
    );
}
