import Link from 'next/link';

export default function Header() {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                    SpotTheDifference
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/games" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                        Games
                    </Link>
                    <Link href="/daily-challenge" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                        Daily Challenge
                    </Link>
                    <Link href="/leaderboard" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                        Leaderboard
                    </Link>
                    <Link href="/streak" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">
                        Streak
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link
                        href="/daily/today"
                        className="hidden md:block px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold hover:shadow-lg transition-all transform hover:scale-105"
                    >
                        Daily Challenge
                    </Link>
                    <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                        Login
                    </button>
                    <button className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5">
                        Play Now
                    </button>
                </div>
            </div>
        </header>
    );
}
