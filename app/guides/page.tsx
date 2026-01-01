import { getPaginatedArticles } from '@/lib/articles';
import ArticleListClient from './ArticleListClient';

export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { articles, currentPage, totalPages, totalArticles, hasNextPage, hasPrevPage } = 
    getPaginatedArticles(page, 12);

  return (
    <ArticleListClient
      initialArticles={articles}
      currentPage={currentPage}
      totalPages={totalPages}
      totalArticles={totalArticles}
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
    />
  );
}