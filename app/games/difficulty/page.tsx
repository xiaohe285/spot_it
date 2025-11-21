import Link from 'next/link';
import { levels } from '@/data/levels';

export default function DifficultyPage() {
    const difficulties = ['Easy', 'Hard', 'Expert'];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/games" className="text-gray-500 hover:text-purple-600">← All Games</Link>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Games by Difficulty</h1>
            </div>

            <div className="space-y-12">
                {difficulties.map((difficulty) => {
                    const difficultyLevels = levels.filter(l => l.difficulty === difficulty);
                    if (difficultyLevels.length === 0) return null;

                    return (
                        <section key={difficulty}>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                {difficulty}
                                <span className={`text-sm px-3 py-1 rounded-full text-white
                  ${difficulty === 'Easy' ? 'bg-green-500' : difficulty === 'Hard' ? 'bg-orange-500' : 'bg-red-600'}`}>
                                    {difficultyLevels.length} Games
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {difficultyLevels.map((level) => (
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
                                                {level.category}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">{level.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">Find {level.differences.length} differences</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
