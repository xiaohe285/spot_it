'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleAlert,
    Clock3,
    History,
    LockKeyhole,
    RotateCcw,
    Search,
    Sparkles,
    Trophy,
    Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DailyChallengeArchiveItem, getDailyChallengeArchive } from '@/lib/levels';

const difficultyStyles = {
    Easy: 'border-emerald-200/70 bg-emerald-500 text-white',
    Medium: 'border-sky-200/70 bg-sky-500 text-white',
    Hard: 'border-orange-200/70 bg-orange-500 text-white',
    Expert: 'border-rose-200/70 bg-rose-500 text-white',
};

export default function DailyChallengeArchivePage() {
    const { user } = useAuth();
    const [archive, setArchive] = useState<DailyChallengeArchiveItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadArchive() {
            try {
                setLoading(true);
                setError(null);

                const { data, error: archiveError } = await getDailyChallengeArchive(user?.id, 30);

                if (archiveError) {
                    throw new Error(archiveError.message || 'Failed to load archive');
                }

                setArchive(data || []);
            } catch (err) {
                console.error('Error loading archive:', err);
                setError(err instanceof Error ? err.message : 'Failed to load archive');
            } finally {
                setLoading(false);
            }
        }

        loadArchive();
    }, [user?.id]);

    const completedCount = archive.filter((item) => item.userRecord?.completed).length;

    return (
        <main className="relative isolate overflow-hidden bg-[#fffaf5] dark:bg-slate-950">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_15%_5%,rgba(251,146,60,0.16),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(139,92,246,0.13),transparent_30%)]" />

            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
                <ArchiveHeader
                    challengeCount={loading ? undefined : archive.length}
                    completedCount={user && !loading ? completedCount : undefined}
                />

                {!user && !loading && !error && (
                    <div className="mb-8 flex items-start gap-4 rounded-2xl border border-violet-200/70 bg-violet-50/80 p-4 text-violet-950 shadow-sm backdrop-blur sm:items-center sm:p-5 dark:border-violet-900/70 dark:bg-violet-950/30 dark:text-violet-100">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-400">
                            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="font-bold">Keep track of every daily win</p>
                            <p className="mt-1 text-sm leading-6 text-violet-700 dark:text-violet-300">
                                Sign in from the header to see your completed challenges, scores, and best times.
                            </p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <ArchiveLoadingState />
                ) : error ? (
                    <ArchiveErrorState message={error} />
                ) : archive.length === 0 ? (
                    <ArchiveEmptyState />
                ) : (
                    <section aria-label="Daily challenge history">
                        <div className="mb-6 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-extrabold tracking-[0.15em] text-orange-600 uppercase dark:text-orange-400">Recent challenges</p>
                                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Explore past puzzles</h2>
                            </div>
                            <p className="hidden text-sm text-slate-500 sm:block dark:text-slate-400">Pick a scene and play at your own pace.</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {archive.map((item, index) => (
                                <ChallengeArchiveCard key={item.date} item={item} isSignedIn={Boolean(user)} eagerImage={index < 3} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

function ArchiveHeader({
    challengeCount,
    completedCount,
}: {
    challengeCount?: number;
    completedCount?: number;
}) {
    return (
        <header className="mb-10 sm:mb-12">
            <Link
                href="/daily/today"
                className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                Back to today&apos;s challenge
            </Link>

            <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-extrabold tracking-[0.15em] text-orange-700 shadow-sm backdrop-blur dark:border-orange-900 dark:bg-slate-900/80 dark:text-orange-300">
                        <History className="h-4 w-4" aria-hidden="true" />
                        DAILY PUZZLE HISTORY
                    </div>
                    <h1 className="text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">Challenge Archive</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                        Revisit recent daily puzzles, discover scenes you missed, and keep sharpening your observation skills.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="min-w-36 rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.1em] text-slate-400 uppercase dark:text-slate-500">
                            <CalendarDays className="h-4 w-4 text-orange-500" aria-hidden="true" />
                            Challenges
                        </div>
                        <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{challengeCount ?? '—'}</p>
                    </div>
                    {completedCount !== undefined && (
                        <div className="min-w-36 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-5 py-4 shadow-sm backdrop-blur dark:border-emerald-900 dark:bg-emerald-950/30">
                            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.1em] text-emerald-700 uppercase dark:text-emerald-400">
                                <Trophy className="h-4 w-4" aria-hidden="true" />
                                Completed
                            </div>
                            <p className="mt-2 text-2xl font-black text-emerald-950 dark:text-emerald-100">{completedCount}</p>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function ChallengeArchiveCard({
    item,
    isSignedIn,
    eagerImage,
}: {
    item: DailyChallengeArchiveItem;
    isSignedIn: boolean;
    eagerImage: boolean;
}) {
    const { challenge, userRecord } = item;
    const { level } = challenge;
    const date = new Date(`${item.date}T12:00:00Z`);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
    const shortDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
    const isCompleted = Boolean(isSignedIn && userRecord?.completed);
    const isMissed = Boolean(isSignedIn && !userRecord?.completed);

    return (
        <article className={`group flex min-h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.4)] dark:bg-slate-900 ${
            isCompleted ? 'border-emerald-200 dark:border-emerald-900/80' : 'border-slate-200/80 dark:border-slate-800'
        }`}>
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                    src={level.image_url_1}
                    alt={level.title}
                    fill
                    sizes="(min-width: 1280px) 380px, (min-width: 768px) 50vw, 100vw"
                    loading={eagerImage ? 'eager' : 'lazy'}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/15" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <span className="rounded-full border border-white/25 bg-slate-950/45 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm backdrop-blur">
                        {shortDate}
                    </span>
                    <span className={`rounded-full border px-3 py-1.5 text-xs font-extrabold shadow-sm ${difficultyStyles[level.difficulty]}`}>
                        {level.difficulty}
                    </span>
                </div>
                {isCompleted && (
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Completed
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                    <CalendarDays className="h-4 w-4 text-orange-500" aria-hidden="true" />
                    <time dateTime={item.date}>{formattedDate}</time>
                    {level.category_name && (
                        <>
                            <span aria-hidden="true">•</span>
                            <span>{level.category_name}</span>
                        </>
                    )}
                </div>

                <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                    {level.title}
                </h3>
                {level.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{level.description}</p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <Search className="h-3.5 w-3.5" aria-hidden="true" />
                        {level.differences.length} differences
                    </span>
                    {challenge.bonus_multiplier > 1 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                            {challenge.bonus_multiplier}x points
                        </span>
                    )}
                </div>

                <div className="mt-auto pt-6">
                    {isCompleted && userRecord ? (
                        <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950/25">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.1em] text-emerald-700 uppercase dark:text-emerald-400">Score</p>
                                <p className="mt-1 font-black text-emerald-950 dark:text-emerald-100">{userRecord.score.toLocaleString()}</p>
                            </div>
                            <div className="border-l border-emerald-200 pl-3 dark:border-emerald-900">
                                <p className="flex items-center gap-1 text-[11px] font-bold tracking-[0.1em] text-emerald-700 uppercase dark:text-emerald-400">
                                    <Clock3 className="h-3 w-3" aria-hidden="true" /> Time
                                </p>
                                <p className="mt-1 font-black text-emerald-950 dark:text-emerald-100">
                                    {userRecord.completion_time != null
                                        ? `${Math.floor(userRecord.completion_time / 60)}:${(userRecord.completion_time % 60).toString().padStart(2, '0')}`
                                        : '—'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="mb-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                            {isMissed ? 'You did not play this daily challenge.' : 'Sign in to see your score and completion history.'}
                        </p>
                    )}

                    <Link
                        href={`/game/${level.slug}?from=daily`}
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold transition ${
                            isCompleted
                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                                : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25'
                        }`}
                    >
                        {isCompleted ? (
                            <>
                                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                Replay challenge
                            </>
                        ) : (
                            <>
                                Play challenge
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                            </>
                        )}
                    </Link>
                </div>
            </div>
        </article>
    );
}

function ArchiveLoadingState() {
    return (
        <section aria-label="Loading challenge archive">
            <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="aspect-[16/10] animate-pulse bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-4 p-6">
                            <div className="h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function ArchiveErrorState({ message }: { message: string }) {
    return (
        <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm sm:p-12 dark:border-rose-900/70 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                <CircleAlert className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">We couldn&apos;t load the archive</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">{message}</p>
            <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Try again
            </button>
        </div>
    );
}

function ArchiveEmptyState() {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12 dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300">
                <Sparkles className="h-8 w-8" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-slate-950 dark:text-white">No daily challenges yet</h2>
            <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-500 dark:text-slate-400">
                New daily puzzles will appear here as they become available. Explore the game library in the meantime.
            </p>
            <Link
                href="/games"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
            >
                Browse all games
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
        </div>
    );
}
