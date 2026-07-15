import { Metadata } from 'next';

const siteUrl = 'https://spotdiffs.com';
const GAME_SRC = 'https://ma-jiang.vercel.app/';

export const metadata: Metadata = {
  title: 'Mahjongg Solitaire - Free Online Mahjong Puzzle Game',
  description:
    'Play Mahjongg Solitaire online for free. Match identical tiles, clear challenging boards, and enjoy timeless mahjong puzzle fun — no download required.',
  keywords:
    'mahjongg solitaire, mahjong solitaire, mahjong puzzle, free mahjong online, tile matching game',
  openGraph: {
    title: 'Mahjongg Solitaire - Free Online Mahjong Puzzle Game',
    description:
      'Play Mahjongg Solitaire online for free. Match tiles, clear boards, and enjoy classic mahjong puzzles.',
    url: `${siteUrl}/mahjongg-solitaire`,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mahjongg Solitaire - Free Online Mahjong Puzzle Game',
    description:
      'Play Mahjongg Solitaire online for free. Match tiles, clear boards, and enjoy classic mahjong puzzles.',
  },
  alternates: {
    canonical: `${siteUrl}/mahjongg-solitaire`,
  },
};

export default function MahjonggSolitairePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Mahjongg Solitaire
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
          Match free tiles of the same type to clear the board. Relax, plan ahead,
          and conquer classic mahjong layouts.
        </p>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
        <iframe
          src={GAME_SRC}
          title="Mahjongg Solitaire Game"
          className="block w-full border-0 bg-white"
          style={{ height: 'min(85vh, 900px)', minHeight: '640px' }}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="fullscreen; autoplay; clipboard-write"
          allowFullScreen
        />
      </div>

      <div className="mt-10 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          How to Play
        </h2>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li>Select two matching free tiles to remove them from the board.</li>
          <li>A tile is free when it is not blocked on the left or right and has nothing stacked on top.</li>
          <li>Clear every tile to finish the layout. Use hints or undo if you get stuck.</li>
        </ul>
      </div>
    </div>
  );
}
