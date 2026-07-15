'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleAuthClick = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    // Close mobile menu on route change or outside click
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) { // md breakpoint
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        SpotDiffs
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/games" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                            Games
                        </Link>
                        <Link href="/daily/today" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                            Daily Challenge
                        </Link>
                        <Link href="/leaderboard" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                            Leaderboard
                        </Link>
                        <Link href="/tile-puzzle" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                            Tile Puzzles
                        </Link>
                        <Link href="/mahjongg-solitaire" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                            Mahjongg Solitaire
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* Search Box - Desktop Only */}
                        <form onSubmit={handleSearch} className="hidden lg:block relative mr-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search games..."
                                className="w-48 pl-4 pr-9 py-1.5 text-sm rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-1 focus:ring-orange-500/20 hover:border-orange-400 dark:hover:border-orange-400 transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            >
                                <svg className="w-4 h-4 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </form>

                        {/* Mobile Games link - show only on mobile when user is not logged in */}
                        {!user && (
                            <Link
                                href="/games"
                                className="md:hidden px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                            >
                                Games
                            </Link>
                        )}

                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                        ) : user ? (
                            <div className="relative group">
                                <div className="flex items-center gap-3 cursor-pointer">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {user.user_metadata?.display_name || user.email?.split('@')[0]}
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold ring-2 ring-transparent group-hover:ring-orange-300 transition-all">
                                        {(user.user_metadata?.display_name || user.email)?.[0]?.toUpperCase()}
                                    </div>
                                </div>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {user.user_metadata?.display_name || user.email?.split('@')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="py-2">
                                        <Link
                                            href="/streak"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Streak
                                        </Link>
                                        <button
                                            onClick={signOut}
                                            className="cursor-pointer w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                        >
                                            <span>🚪</span>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Desktop: Show both buttons */}
                                <div className="hidden md:flex items-center gap-4">
                                    <button
                                        onClick={() => handleAuthClick('login')}
                                        className="cursor-pointer px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Login
                                    </button>
                                    {/* <button
                                        onClick={() => handleAuthClick('signup')}
                                        className="cursor-pointer px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
                                    >
                                        Sign Up
                                    </button> */}
                                </div>

                                {/* Mobile: Show single combined button */}
                                <button
                                    onClick={() => handleAuthClick('login')}
                                    className="md:hidden cursor-pointer px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                                >
                                    Sign In
                                </button>
                            </>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
                        <div className="px-4 py-4 space-y-2">
                            <Link 
                                href="/games" 
                                className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Games
                            </Link>
                            <Link 
                                href="/daily/today" 
                                className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Daily Challenge
                            </Link>
                            <Link 
                                href="/guides" 
                                className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Guides
                            </Link>
                            <Link 
                                href="/leaderboard" 
                                className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Leaderboard
                            </Link>
                            <Link
                                href="/tile-puzzle"
                                className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Tile Puzzles
                            </Link>
                            <Link
                                href="/mahjongg-solitaire"
                                className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Mahjongg Solitaire
                            </Link>
                            
                            {!user && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                                    <button
                                        onClick={() => {
                                            handleAuthClick('login');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleAuthClick('signup');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 mt-1 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )}

                            {user && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                                    <div className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                                        {user.user_metadata?.display_name || user.email?.split('@')[0]}
                                    </div>
                                    <Link
                                        href="/streak"
                                        className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Streak
                                    </Link>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode={authMode}
            />
        </>
    );
}
