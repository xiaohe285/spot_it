import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { Article } from '@/types';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

export function getSortedArticlesData(): Omit<Article, 'content'>[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(articlesDirectory);
  const allArticlesData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      const wordCount = matterResult.content.split(/\s+/g).length;
      const readingTime = Math.ceil(wordCount / 200);

      return {
        slug,
        title: matterResult.data.title || '',
        excerpt: matterResult.data.excerpt || '',
        coverImage: matterResult.data.coverImage || '/images/default-cover.jpg',
        date: matterResult.data.date || new Date().toISOString(),
        author: matterResult.data.author || 'Anonymous',
        category: matterResult.data.category || 'General',
        tags: matterResult.data.tags || [],
        readingTime,
      };
    });

  return allArticlesData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllArticleSlugs() {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(articlesDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
      return {
        slug: fileName.replace(/\.md$/, ''),
      };
    });
}

export async function getArticleData(slug: string): Promise<Article | null> {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const processedContent = await remark()
      .use(remarkGfm)
      .use(html)
      .process(matterResult.content);
    const contentHtml = processedContent.toString();

    const wordCount = matterResult.content.split(/\s+/g).length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      slug,
      title: matterResult.data.title || '',
      excerpt: matterResult.data.excerpt || '',
      content: contentHtml,
      coverImage: matterResult.data.coverImage || '/images/default-cover.jpg',
      date: matterResult.data.date || new Date().toISOString(),
      author: matterResult.data.author || 'Anonymous',
      category: matterResult.data.category || 'General',
      tags: matterResult.data.tags || [],
      readingTime,
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

export function getPaginatedArticles(page: number = 1, pageSize: number = 12) {
  const allArticles = getSortedArticlesData();
  const totalPages = Math.ceil(allArticles.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const articles = allArticles.slice(startIndex, endIndex);

  return {
    articles,
    currentPage: page,
    totalPages,
    totalArticles: allArticles.length,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}