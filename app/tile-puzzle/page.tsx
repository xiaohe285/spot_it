import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getTilePuzzles } from '@/lib/db/tile-puzzles';
import Pagination from '@/components/Pagination';

export const metadata: Metadata = {
  title: 'Tile Puzzle Games - Challenge Your Mind with Grid Puzzles',
  description: 'Play free online tile puzzle games! Arrange grid pieces to reveal beautiful images. Choose from 3x3, 4x4, and 5x5 grids. Challenge yourself with our collection of sliding tile puzzles.',
  keywords: 'tile puzzle, sliding puzzle, grid puzzle, jigsaw puzzle, brain games, puzzle games online, free puzzle games',
  openGraph: {
    title: 'Tile Puzzle Games - Challenge Your Mind',
    description: 'Play free online tile puzzle games! Arrange grid pieces to reveal beautiful images.',
    type: 'website',
  },
};

interface TilePuzzlePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TilePuzzlePage({ searchParams }: TilePuzzlePageProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;

  const { puzzles, total, page, pageSize, totalPages } = await getTilePuzzles(currentPage, 24);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Tile Puzzle Games
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Challenge yourself with our collection of grid-based tile puzzles. Arrange the pieces to reveal beautiful images!
        </p>
      </div>

      {puzzles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">暂无拼图游戏数据</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {puzzles.map((puzzle, index) => (
              <Link
                key={puzzle.id}
                href={`/tile-puzzle/play/${puzzle.slug}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={puzzle.imageUrl}
                    alt={puzzle.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading={index < 6 ? "eager" : "lazy"}
                    priority={index < 6}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                  />
                  {puzzle.featured && (
                    <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      FEATURED
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pb-3 pt-10">
                    <h3 className="truncate text-lg font-bold text-white">
                      {puzzle.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            basePath="/tile-puzzle"
          />
        </>
      )}
    </div>
  );
}
