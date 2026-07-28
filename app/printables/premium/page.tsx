import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Crown,
  Download,
  FileCheck2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import PayPalCheckout from "@/components/printables/PayPalCheckout";
import PrintableCard from "@/components/printables/PrintableCard";
import { formatPrintablePrice } from "@/data/printables";
import { getPrintableCatalog } from "@/lib/db/printables";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SpotDiffs Premium Printable PDF Access",
  description:
    "Unlock all current and new Premium spot the difference printable PDFs for 31 days with one PayPal purchase.",
  alternates: {
    canonical: "https://spotdiffs.com/printables/premium",
  },
};

export default async function PremiumPrintablesPage() {
  const { premiumPlan, products } = await getPrintableCatalog();
  const includedProducts = products.filter(
    (product) => product.isPremiumIncluded,
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/70 via-white to-white py-8 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 md:py-10">
      <div className="mx-auto max-w-7xl px-4">
        <Link
          href="/printables"
          className="mb-7 inline-flex items-center gap-1 text-sm font-bold text-slate-600 transition-colors hover:text-orange-600 dark:text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          All printables
        </Link>

        <section className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_24px_70px_rgba(249,115,22,0.12)] dark:border-slate-800 dark:bg-slate-900">
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-200/60 blur-3xl dark:bg-orange-900/20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-pink-200/55 blur-3xl dark:bg-pink-900/20"
            aria-hidden="true"
          />

          <div className="relative grid lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <div className="px-6 py-9 md:px-10 md:py-12 lg:px-12 lg:py-14">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-200 dark:shadow-none">
                  <Crown className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300">
                  {premiumPlan.badge}
                </span>
              </div>

              <p className="mt-7 text-sm font-extrabold uppercase tracking-[0.18em] text-orange-600">
                {premiumPlan.title}
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
                One pass. Every Premium printable.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {premiumPlan.description}
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {premiumPlan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white/70 px-3.5 py-3 text-sm font-semibold leading-5 text-slate-700 backdrop-blur dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200/80 pt-6 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4 text-orange-500" aria-hidden="true" />
                  Instant digital access
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  Secure PayPal checkout
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-pink-500" aria-hidden="true" />
                  No auto-renewal
                </span>
              </div>
            </div>

            <aside className="relative border-t border-orange-100 bg-gradient-to-br from-orange-50/80 to-pink-50/70 p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 md:p-8 lg:border-l lg:border-t-0 lg:p-9">
              <div className="mb-5">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Full Premium access
                </p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-black text-slate-950 dark:text-white">
                    {formatPrintablePrice(premiumPlan)}
                  </span>
                  <span className="pb-1 text-sm font-semibold text-slate-500">
                    / {premiumPlan.accessDays} days
                  </span>
                </div>
              </div>
              <PayPalCheckout
                purchaseType="premium"
                itemSlug={premiumPlan.slug}
                priceLabel={formatPrintablePrice(premiumPlan)}
                accessDays={premiumPlan.accessDays}
              />
              <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                One-time payment in USD. Access does not renew automatically.
                Digital products are subject to the{" "}
                <Link
                  href="/refund-policy"
                  className="font-semibold underline underline-offset-2 hover:text-orange-600"
                >
                  refund policy
                </Link>
                .
              </p>
            </aside>
          </div>
        </section>

        <section className="mt-16 pb-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-extrabold text-orange-600">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Included right now
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
                Start downloading today
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Every pack below is included with Premium and comes with
                printable puzzles and complete answer keys.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-extrabold text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300">
              <FileCheck2 className="h-4 w-4" aria-hidden="true" />
              {includedProducts.length} printable packs
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {includedProducts.map((product) => (
              <PrintableCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
