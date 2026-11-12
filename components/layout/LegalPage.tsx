import Link from 'next/link';
import type { ReactNode } from 'react';

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-12">
        <h1 className="text-4xl font-bold text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Version 2.0 · Last updated: November 12, 2026</p>
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-slate-800 dark:border-amber-800 dark:bg-amber-950 dark:text-slate-200">
          Questions about membership, billing, refunds, or privacy? Email{' '}
          <a href="mailto:support@spotdiffs.com" className="font-semibold underline underline-offset-4">support@spotdiffs.com</a>.
        </div>
        <div className="mt-10 space-y-10 leading-7 text-slate-700 dark:text-slate-300 [&_a]:font-semibold [&_a]:text-purple-700 [&_a]:underline [&_a]:underline-offset-4 dark:[&_a]:text-purple-300 [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_h3]:font-bold [&_h3]:text-slate-950 dark:[&_h3]:text-white">
          {children}
        </div>
        <nav aria-label="Legal and support pages" className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200 pt-6 text-sm font-semibold text-purple-700 dark:border-slate-700 dark:text-purple-300">
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/refund-policy" className="hover:underline">Delivery &amp; Refunds</Link>
          <Link href="/contact" className="hover:underline">Contact support</Link>
        </nav>
      </article>
    </div>
  );
}
