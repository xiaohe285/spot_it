'use client';

import { TilePuzzle } from '@/types';
import TilePuzzleGame from './TilePuzzleGame';

interface TilePuzzleGameClientProps {
  puzzle: TilePuzzle;
}

export default function TilePuzzleGameClient({ puzzle }: TilePuzzleGameClientProps) {
  return <TilePuzzleGame puzzle={puzzle} />;
}
