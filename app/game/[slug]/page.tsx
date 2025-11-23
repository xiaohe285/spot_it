import { Metadata } from 'next';
import { generateGameMetadata } from './metadata';
import GamePageClient from './GamePageClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return generateGameMetadata(slug);
}

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  return <GamePageClient params={params} />;
}
