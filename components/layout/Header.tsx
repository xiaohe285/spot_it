'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
    const { user, loading, signOut } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    const handleAuthClick = (mode: 'login' | 'signup') => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

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
                        <Link href="/streak" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">
                            Streak
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
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
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold ring-2 ring-transparent group-hover:ring-purple-300 transition-all">
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
                                <button
                                    onClick={() => handleAuthClick('login')}
                                    className="cursor-pointer px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => handleAuthClick('signup')}
                                    className="cursor-pointer px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode={authMode}
            />
        </>
    );
}
