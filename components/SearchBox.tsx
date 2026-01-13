'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBoxProps {
  initialQuery?: string;
}

export default function SearchBox({ initialQuery = '' }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for games by title or theme..."
          className="w-full pl-14 pr-36 py-4 text-lg rounded-full border-2 border-orange-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-orange-500 dark:focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 hover:border-orange-300 dark:hover:border-orange-400 transition-all shadow-sm hover:shadow-md"
        />
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-400 group-focus-within:text-orange-500 transition-colors">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="absolute right-2 top-2 bottom-2">
          <button
            type="submit"
            className="cursor-pointer h-full px-8 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-lg rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            disabled={!query.trim()}
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
