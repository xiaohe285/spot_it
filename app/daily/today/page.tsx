import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowRight,
    CalendarDays,
    Check,
    ChevronRight,
    Flame,
    FolderClock,
    Medal,
    Search,
    Zap,
} from 'lucide-react';
import { getTodaysChallenge } from '@/lib/levels';

const siteUrl = 'https://spotdiffs.com';

export const metadata: Metadata = {
    title: 'Spot the Difference Daily Challenge - Today\'s Puzzle',
    description: 'Play today\'s daily spot the difference challenge! Earn double points and exclusive badges by completing the daily puzzle.',
    openGraph: {
        title: 'Spot the Difference Daily Challenge - Today\'s Puzzle',
        description: 'Play today\'s daily spot the difference challenge! Earn double points and exclusive badges.',
        url: `${siteUrl}/daily/today`,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Spot the Difference Daily Challenge - Today\'s Puzzle',
        description: 'Play today\'s daily puzzle and earn exclusive rewards!',
    },
    alternates: {
        canonical: `${siteUrl}/daily/today`,
    },
};

const difficultyStyles = {
    Easy: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    Hard: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
    Expert: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
};

export default async function DailyChallengePage() {
    const { data: todaysChallenge, error } = await getTodaysChallenge();

    if (error) {
        console.error('Error fetching today\'s challenge:', error);
    }

    if (!todaysChallenge) {
        return <EmptyChallengeState />;
    }

    const { level } = todaysChallenge;
    const differenceCount = level.differences.length;
    const badgeName = todaysChallenge.special_badge || 'Daily Champion';
    const challengeTitle = todaysChallenge.special_title || 'Today\'s Daily Challenge';

    const rewards = [
        {
            icon: Medal,
            eyebrow: 'Exclusive reward',
            title: badgeName,
            description: 'Complete today\'s puzzle to add this limited daily badge to your achievements.',
            iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
        },
        {
            icon: Zap,
            eyebrow: 'Score boost',
            title: `${todaysChallenge.bonus_multiplier}x Points`,
            description: `Every difference you find today is worth ${todaysChallenge.bonus_multiplier}x the usual points.`,
            iconClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
        },
        {
            icon: Flame,
            eyebrow: 'Keep it going',
            title: 'Daily Streak',
            description: 'Finish the challenge today and keep building your daily puzzle momentum.',
            iconClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        },
    ];

    return (
        <div className="relative isolate overflow-hidden bg-[#fffaf5] dark:bg-slate-950">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(circle_at_20%_10%,rgba(251,146,60,0.16),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(236,72,153,0.12),transparent_32%)]" />

            <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
                <div className="mx-auto max-w-6xl">
                    <header className="mb-10 max-w-4xl">
                        <h1 className="max-w-4xl text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                            {challengeTitle}
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">
                            Find all {differenceCount} differences, sharpen your focus, and collect today&apos;s bonus rewards.
                        </p>
                    </header>

                    <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:bg-slate-900" aria-labelledby="challenge-card-title">
                        <div className="grid lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
                            <div className="relative min-h-[360px] overflow-hidden sm:min-h-[500px] lg:min-h-[570px]">
                                <Image
                                    src={level.image_url_1}
                                    alt={level.title}
                                    fill
                                    priority
                                    sizes="(min-width: 1024px) 720px, 100vw"
                                    className="object-cover transition-transform duration-700 hover:scale-[1.025]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/5 to-slate-950/10" />

                                <div className="absolute left-5 top-5 flex flex-wrap gap-2 sm:left-7 sm:top-7">
                                    <span className={`rounded-full border px-3.5 py-1.5 text-xs font-extrabold shadow-sm backdrop-blur ${difficultyStyles[level.difficulty]}`}>
                                        {level.difficulty}
                                    </span>
                                    {level.category_name && (
                                        <span className="rounded-full border border-white/30 bg-slate-950/45 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur">
                                            {level.category_name}
                                        </span>
                                    )}
                                </div>

                                <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
                                    <p className="mb-2 text-xs font-bold tracking-[0.18em] text-orange-300 uppercase">Today&apos;s scene</p>
                                    <h2 id="challenge-card-title" className="text-2xl font-extrabold text-white sm:text-3xl">
                                        {level.title}
                                    </h2>
                                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white/75">
                                        <Search className="h-4 w-4" aria-hidden="true" />
                                        Look closely — every detail matters.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col p-6 sm:p-8 lg:p-9">
                                <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                                    Ready to test your eyes?
                                </h2>
                                <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                                    Study both pictures and tap each detail that has changed.
                                </p>

                                <div className="my-7 space-y-4 border-y border-slate-100 py-6 dark:border-slate-800">
                                    {[
                                        `${differenceCount} differences to discover`,
                                        `${level.difficulty} difficulty`,
                                        `${todaysChallenge.bonus_multiplier}x points for today`,
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                                            </span>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <Link
                                        href={`/game/${level.slug}?from=daily`}
                                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                                    >
                                        Play today&apos;s challenge
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                    </Link>
                                    <Link
                                        href="/daily/archive"
                                        className="group mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/70 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-700 dark:hover:bg-violet-950/30"
                                    >
                                        <FolderClock className="h-4 w-4 transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400" aria-hidden="true" />
                                        <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text transition-colors group-hover:text-transparent dark:from-violet-400 dark:to-pink-400">
                                            Challenge archive
                                        </span>
                                        <ChevronRight className="h-4 w-4 transition-all group-hover:translate-x-1 group-hover:text-pink-500" aria-hidden="true" />
                                    </Link>
                                    <p className="mt-3 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                                        Start whenever you&apos;re ready
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-16" aria-labelledby="rewards-title">
                        <div className="mb-7 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-xs font-extrabold tracking-[0.16em] text-violet-600 uppercase dark:text-violet-400">Worth the challenge</p>
                                <h2 id="rewards-title" className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Today&apos;s rewards</h2>
                            </div>
                            <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-right dark:text-slate-400">
                                One puzzle, three ways to make today&apos;s play count.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {rewards.map((reward) => {
                                const Icon = reward.icon;

                                return (
                                    <article key={reward.title} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                                        <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${reward.iconClass}`}>
                                            <Icon className="h-6 w-6" aria-hidden="true" />
                                        </div>
                                        <p className="text-xs font-bold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">{reward.eyebrow}</p>
                                        <h3 className="mt-2 text-xl font-extrabold text-slate-950 dark:text-white">{reward.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{reward.description}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    {(level.category_name || level.description) && (
                        <section className="mt-8 rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-rose-50 p-6 sm:p-8 dark:border-orange-950 dark:from-orange-950/30 dark:to-rose-950/20" aria-labelledby="about-puzzle-title">
                            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm dark:bg-slate-900 dark:text-orange-400">
                                    <Search className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 id="about-puzzle-title" className="text-xl font-extrabold text-slate-950 dark:text-white">About this puzzle</h2>
                                        {level.category_name && (
                                            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm dark:bg-slate-900 dark:text-orange-300">
                                                {level.category_name}
                                            </span>
                                        )}
                                    </div>
                                    {level.description && (
                                        <p className="mt-3 max-w-4xl leading-7 text-slate-600 dark:text-slate-300">{level.description}</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

function EmptyChallengeState() {
    return (
        <div className="relative isolate overflow-hidden bg-[#fffaf5] px-4 py-16 sm:px-6 sm:py-24 dark:bg-slate-950">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(251,146,60,0.2),transparent_45%)]" />
            <div className="mx-auto max-w-2xl rounded-[2rem] border border-orange-100 bg-white p-8 text-center shadow-xl shadow-orange-900/5 sm:p-12 dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
                    <CalendarDays className="h-8 w-8" aria-hidden="true" />
                </div>
                <p className="mt-7 text-xs font-extrabold tracking-[0.16em] text-orange-600 uppercase dark:text-orange-400">Daily challenge</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">Today&apos;s puzzle is almost ready</h1>
                <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600 dark:text-slate-300">
                    Check back soon, or jump into another puzzle while today&apos;s challenge is being prepared.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href="/games" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5">
                        Browse all games
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link href="/daily/archive" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-3.5 font-bold text-slate-700 transition hover:border-violet-200 hover:text-violet-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-violet-700 dark:hover:text-violet-300">
                        View archive
                        <FolderClock className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
