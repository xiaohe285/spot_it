import Link from 'next/link';

export default function DailyChallengeArchivePage() {
    // Mock archive data
    const archive = [
        { date: '2023-11-20', title: 'The Hidden Temple', id: '2', slug: 'the-hidden-temple', status: 'played', score: 950 },
        { date: '2023-11-19', title: 'Sunny Beach', id: '1', slug: 'sunny-beach', status: 'played', score: 1000 },
        { date: '2023-11-18', title: 'Cute Animals', id: '3', slug: 'cute-animals', status: 'missed', score: 0 },
        { date: '2023-11-17', title: 'City Night', id: '2', slug: 'city-night', status: 'missed', score: 0 },
        { date: '2023-11-16', title: 'Forest Mystery', id: '1', slug: 'forest-mystery', status: 'played', score: 880 },
        { date: '2023-11-15', title: 'Ocean Depths', id: '3', slug: 'ocean-depths', status: 'missed', score: 0 },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/daily/today" className="text-gray-500 hover:text-purple-600">← Back to Today</Link>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Challenge Archive</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archive.map((challenge) => {
                    const date = new Date(challenge.date);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    return (
                        <div
                            key={challenge.date}
                            className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                                challenge.status === 'played'
                                    ? 'border-green-100 dark:border-green-900/30'
                                    : 'border-gray-100 dark:border-gray-700'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                </div>
                                {challenge.status === 'played' ? (
                                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase">
                                        Completed
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                                        Missed
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{challenge.title}</h3>

                            {challenge.status === 'played' && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                    Score: <span className="font-bold text-purple-600">{challenge.score}</span>
                                </div>
                            )}

                            {challenge.status === 'missed' && (
                                <div className="text-sm text-gray-400 mb-6 italic">
                                    Did not participate
                                </div>
                            )}

                            <Link
                                href={`/game/${challenge.slug}`}
                                className={`block w-full py-3 rounded-xl font-bold text-center transition-colors ${
                                    challenge.status === 'played'
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-purple-500/30'
                                }`}
                            >
                                {challenge.status === 'played' ? 'Replay Challenge' : 'Play Challenge'}
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
