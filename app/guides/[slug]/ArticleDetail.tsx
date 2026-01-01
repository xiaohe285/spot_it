'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Article } from '@/types';
import { format } from 'date-fns';
import { ArrowLeft, Clock, User, Calendar, Tag } from 'lucide-react';

interface ArticleDetailProps {
  article: Article;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 mb-6 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Guides
        </Link>

        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-64 md:h-96">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="inline-block bg-purple-600 text-white px-3 py-1 rounded-full text-sm mb-4">
                {article.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-200 text-sm">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(article.date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.readingTime} min read</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {article.excerpt && (
              <div className="mb-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-600">
                <p className="text-gray-700 dark:text-gray-300 italic">
                  {article.excerpt}
                </p>
              </div>
            )}

            <div 
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:text-gray-800 dark:prose-headings:text-gray-100
                prose-p:text-gray-600 dark:prose-p:text-gray-300
                prose-a:text-purple-600 dark:prose-a:text-purple-400
                prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-800 dark:prose-strong:text-gray-200
                prose-code:bg-gray-100 dark:prose-code:bg-gray-700
                prose-code:text-purple-600 dark:prose-code:text-purple-400
                prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950
                prose-pre:text-gray-100
                prose-img:rounded-lg prose-img:shadow-lg
                prose-blockquote:border-l-purple-600
                prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800
                prose-blockquote:px-4 prose-blockquote:py-1
                prose-li:text-gray-600 dark:prose-li:text-gray-300
                prose-ul:list-disc prose-ol:list-decimal
                [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold
                [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-xl [&>h3]:font-semibold
                [&>p]:mb-4 [&>p]:leading-relaxed
                [&>ul]:mb-4 [&>ul]:ml-6
                [&>ol]:mb-4 [&>ol]:ml-6
                [&>blockquote]:my-6
                [&>pre]:my-6"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 p-6 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                About the Author
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">{article.author}</span> is a passionate gamer and puzzle enthusiast 
                who loves sharing tips and strategies to help others master the art of finding differences.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Guides
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}