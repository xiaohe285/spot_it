'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock, User, Calendar } from 'lucide-react';
import { Article } from '@/types';
import { format } from 'date-fns';

interface ArticleListClientProps {
  initialArticles: Omit<Article, 'content'>[];
  currentPage: number;
  totalPages: number;
  totalArticles: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ArticleListClient({
  initialArticles,
  currentPage: initialPage,
  totalPages,
  totalArticles,
  hasNextPage: initialHasNext,
  hasPrevPage: initialHasPrev,
}: ArticleListClientProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [articles] = useState(initialArticles);
  const [hasNextPage] = useState(initialHasNext);
  const [hasPrevPage] = useState(initialHasPrev);

  const pageNumbers = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Game Guides & Tutorials
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Master the art of finding differences with our comprehensive guides and expert tips
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-xl">
              No articles available yet. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article) => (
                <Link
                  href={`/guides/${article.slug}`}
                  key={article.slug}
                  className="group"
                >
                  <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 right-2 bg-purple-600 text-white px-2 py-1 rounded text-sm">
                        {article.category}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(article.date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.readingTime} min read</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {article.author}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Link
                  href={hasPrevPage ? `/guides?page=${currentPage - 1}` : '#'}
                  className={`p-2 rounded-lg transition-all ${
                    hasPrevPage
                      ? 'bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  aria-disabled={!hasPrevPage}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>

                <div className="flex gap-1">
                  {startPage > 1 && (
                    <>
                      <Link
                        href="/guides?page=1"
                        className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900 text-gray-700 dark:text-gray-300 transition-all"
                      >
                        1
                      </Link>
                      {startPage > 2 && (
                        <span className="px-2 py-2 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {pageNumbers.map((number) => (
                    <Link
                      key={number}
                      href={`/guides?page=${number}`}
                      className={`px-3 py-2 rounded-lg transition-all ${
                        currentPage === number
                          ? 'bg-orange-500 text-white'
                          : 'bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {number}
                    </Link>
                  ))}

                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && (
                        <span className="px-2 py-2 text-gray-500">...</span>
                      )}
                      <Link
                        href={`/guides?page=${totalPages}`}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900 text-gray-700 dark:text-gray-300 transition-all"
                      >
                        {totalPages}
                      </Link>
                    </>
                  )}
                </div>

                <Link
                  href={hasNextPage ? `/guides?page=${currentPage + 1}` : '#'}
                  className={`p-2 rounded-lg transition-all ${
                    hasNextPage
                      ? 'bg-white dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-orange-900 text-orange-600 dark:text-orange-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                  aria-disabled={!hasNextPage}
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            )}

            <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {articles.length} of {totalArticles} articles
            </div>
          </>
        )}
      </div>
    </div>
  );
}