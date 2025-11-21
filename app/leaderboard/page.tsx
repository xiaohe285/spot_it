export default function LeaderboardPage() {
    const leaderboardData = [
        { rank: 1, name: "EagleEye", score: 15420, avatar: "🦅", country: "🇺🇸" },
        { rank: 2, name: "PixelHunter", score: 14200, avatar: "🕵️", country: "🇬🇧" },
        { rank: 3, name: "SpotMaster", score: 13850, avatar: "👑", country: "🇨🇦" },
        { rank: 4, name: "Visionary", score: 12100, avatar: "👁️", country: "🇦🇺" },
        { rank: 5, name: "SharpShooter", score: 11500, avatar: "🎯", country: "🇩🇪" },
        { rank: 6, name: "FocusQueen", score: 10900, avatar: "👸", country: "🇫🇷" },
        { rank: 7, name: "DetailNinja", score: 9800, avatar: "🥷", country: "🇯🇵" },
        { rank: 8, name: "ZoomIn", score: 9200, avatar: "🔍", country: "🇧🇷" },
        { rank: 9, name: "FindItFast", score: 8750, avatar: "⚡️", country: "🇮🇳" },
        { rank: 10, name: "HawkEye", score: 8100, avatar: "🦅", country: "🇪🇸" },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 text-center">Global Leaderboard</h1>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-12">The top spotters of the week</p>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-6">Player</div>
                        <div className="col-span-4 text-right">Score</div>
                    </div>

                    {/* List */}
                    <div className="divide-y divide-gray-100">
                        {leaderboardData.map((player) => (
                            <div key={player.rank} className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="col-span-2 flex justify-center">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                    ${player.rank === 1 ? 'bg-yellow-400 text-white' :
                                            player.rank === 2 ? 'bg-gray-400 text-white' :
                                                player.rank === 3 ? 'bg-orange-400 text-white' : 'text-gray-500'}`}>
                                        {player.rank}
                                    </div>
                                </div>
                                <div className="col-span-6 flex items-center gap-4">
                                    <div className="text-2xl">{player.avatar}</div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            {player.name}
                                            <span className="text-sm opacity-50">{player.country}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-4 text-right font-mono font-bold text-purple-600 text-lg">
                                    {player.score.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
