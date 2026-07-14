import Link from 'next/link';
import Image from 'next/image';
import type { DifferenceCountGroup } from '@/lib/levels';

const difficultyConfig = {
  Easy: {
    stars: 1,
    label: 'Easy',
    accent: 'bg-green-500',
  },
  Hard: {
    stars: 2,
    label: 'Hard',
    accent: 'bg-orange-500',
  },
  Expert: {
    stars: 3,
    label: 'Expert',
    accent: 'bg-red-600',
  },
} as const;

const descriptions: Record<number, string> = {
  2: 'Quick puzzles with just two differences — perfect for a warm-up or younger players.',
  3: 'Classic three-difference games. Clear scenes with a satisfying, bite-sized challenge.',
  4: 'Find four hidden differences. A balanced mix of focus and fun for everyday play.',
  5: 'Five differences to spot. Great for players who want a fuller visual challenge.',
  6: 'Six differences packed into each scene — stay sharp and take your time.',
  7: 'Seven differences await. Ideal when you want a longer, more careful search.',
  8: 'Eight differences to uncover. A thorough workout for your observation skills.',
  9: 'Nine differences in every puzzle — patient eyes will be rewarded.',
  10: 'Ten differences to find. Dense scenes built for dedicated puzzle fans.',
};

function getDescription(count: number): string {
  return (
    descriptions[count] ||
    `Browse spot the difference games with exactly ${count} differences to find in each puzzle.`
  );
}

interface DifferenceCountCardProps {
  group: DifferenceCountGroup;
}

export default function DifferenceCountCard({ group }: DifferenceCountCardProps) {
  const { count, gameCount, coverImage, difficulty } = group;
  const config = difficultyConfig[difficulty];
  const href = `/games/differences/${count}`;

  return (
    <article className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
      <Link href={href} className="relative block h-52 overflow-hidden">
        <Image
          src={coverImage}
          alt={`${count} differences spot the difference games`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/45 group-hover:bg-black/50 transition-colors" />

        <div className="absolute top-4 left-4 z-10">
          <span className="inline-flex items-center gap-1.5 pl-0 pr-3 py-1 rounded-full bg-black/70 backdrop-blur text-white text-sm font-semibold overflow-hidden">
            <span className={`w-1.5 self-stretch ${config.accent}`} aria-hidden />
            <span className="pl-2 text-amber-400 tracking-tight" aria-hidden>
              {'★'.repeat(config.stars)}
            </span>
            <span>{config.label}</span>
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <span className="text-6xl md:text-7xl font-black leading-none drop-shadow-lg">
            {count}
          </span>
          <span className="mt-1 text-sm md:text-base font-bold uppercase tracking-[0.2em] drop-shadow">
            Differences
          </span>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          <Link href={href}>{count} Differences Games</Link>
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5 flex-1">
          {getDescription(count)}
        </p>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex items-center justify-between gap-3">
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {gameCount} {gameCount === 1 ? 'Game' : 'Games'}
          </span>
          <Link
            href={href}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-orange-500/30"
          >
            Play Now
          </Link>
        </div>
      </div>
    </article>
  );
}
