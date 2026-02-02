import { notFound } from 'next/navigation';
import { getTilePuzzleBySlug } from '@/lib/db/tile-puzzles';
import TilePuzzleGameClient from '@/components/tile-puzzle/TilePuzzleGameClient';
import { Metadata } from 'next';

interface TilePuzzlePlayPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TilePuzzlePlayPageProps): Promise<Metadata> {
  return {
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

export default async function TilePuzzlePlayPage({ params }: TilePuzzlePlayPageProps) {
  const { slug } = await params;

  const puzzle = await getTilePuzzleBySlug(slug);

  if (!puzzle) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Game Component with integrated header */}
      <TilePuzzleGameClient puzzle={puzzle} />
    </div>
  );
}
