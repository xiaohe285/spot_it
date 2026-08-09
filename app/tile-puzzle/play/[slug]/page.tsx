import { notFound } from 'next/navigation';
import { getTilePuzzleBySlug } from '@/lib/db/tile-puzzles';
import TilePuzzleGameClient from '@/components/tile-puzzle/TilePuzzleGameClient';
import { Metadata } from 'next';

interface TilePuzzlePlayPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
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
    <div className="min-h-[calc(100vh-4rem)]">
      <TilePuzzleGameClient puzzle={puzzle} />
    </div>
  );
}
