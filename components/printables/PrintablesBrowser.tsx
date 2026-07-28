"use client";

import {
  startTransition,
  useMemo,
  useOptimistic,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Crown,
  Download,
  ShieldCheck,
  SlidersVertical,
  Sparkles,
  X,
} from "lucide-react";
import PrintableCard from "@/components/printables/PrintableCard";
import {
  formatPrintablePrice,
  type PrintableFilterGroup,
  type PrintablePremiumPlan,
  type PrintableProduct,
} from "@/data/printables";
import {
  buildPrintableBrowsePath,
  buildPrintableBrowseTitle,
  emptyPrintableFilters,
  filterPrintableProducts,
  updatePrintableFilterSelection,
  type SelectedPrintableFilters,
} from "@/lib/printableFilters";

type SortOption = "relevance" | "popular" | "newest" | "price-low" | "pages";

export default function PrintablesBrowser({
  products,
  filterGroups,
  premiumPlan,
  initialSelected = emptyPrintableFilters(),
}: {
  products: PrintableProduct[];
  filterGroups: PrintableFilterGroup[];
  premiumPlan: PrintablePremiumPlan;
  initialSelected?: SelectedPrintableFilters;
}) {
  const router = useRouter();
  const [selected, setOptimisticSelected] = useOptimistic(initialSelected);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [allFiltersOpen, setAllFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("relevance");

  const selectedCount = Object.values(selected).reduce(
    (count, values) => count + values.length,
    0,
  );

  const filteredProducts = useMemo(() => {
    const matching = filterPrintableProducts(products, selected);

    return matching.toSorted((a, b) => {
      switch (sort) {
        case "popular":
          return b.salesCount - a.salesCount;
        case "newest":
          return (
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
          );
        case "price-low":
          return a.priceCents - b.priceCents;
        case "pages":
          return b.totalPages - a.totalPages;
        default:
          return (
            b.salesCount +
            b.keywordSignals.length * 50 -
            (a.salesCount + a.keywordSignals.length * 50)
          );
      }
    });
  }, [products, selected, sort]);

  function navigateToFilters(next: SelectedPrintableFilters) {
    const nextPath = buildPrintableBrowsePath(next, filterGroups);
    startTransition(() => {
      setOptimisticSelected(next);
      router.push(nextPath, { scroll: false });
    });
  }

  function toggleOption(groupSlug: string, optionSlug: string) {
    setOpenGroup(null);
    navigateToFilters(
      updatePrintableFilterSelection(
        selected,
        filterGroups,
        groupSlug,
        optionSlug,
      ),
    );
  }

  function clearGroup(groupSlug: string) {
    setOpenGroup(null);
    navigateToFilters({ ...selected, [groupSlug]: [] });
  }

  const primaryGroups = filterGroups.slice(0, 5);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold text-orange-600">
              Printable PDF games
            </p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">
              {buildPrintableBrowseTitle(selected, filterGroups)}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "resource" : "resources"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="printables-sort"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300"
            >
              Sort by
            </label>
            <div className="relative">
              <select
                id="printables-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="relevance">Relevance</option>
                <option value="popular">Most popular</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: low to high</option>
                <option value="pages">Most pages</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex flex-wrap items-center gap-2 border-b border-slate-200 py-5 dark:border-slate-800">
          {primaryGroups.map((group) => {
            const selectedOptions = group.options.filter((option) =>
              selected[group.slug]?.includes(option.slug),
            );
            const active = selectedOptions.length > 0;

            return (
              <div key={group.slug} className="relative">
                <div
                  className={`flex h-10 min-w-[10.5rem] cursor-pointer items-stretch overflow-hidden rounded-full border text-[16px] font-bold leading-none text-[#26282f] transition-colors duration-150 dark:text-slate-100 ${
                    active
                      ? "printable-filter-pill--active border-[#2fd179] bg-[#e4fff2] dark:border-emerald-500 dark:bg-emerald-950/45"
                      : "printable-filter-pill--inactive border-transparent bg-[#f2f2f2] dark:bg-slate-900"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === group.slug ? null : group.slug,
                      )
                    }
                    className="min-w-0 flex-1 cursor-pointer truncate pl-4 pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                    aria-expanded={openGroup === group.slug}
                  >
                    {active ? selectedOptions[0].label : group.label}
                  </button>

                  {active && (
                    <button
                      type="button"
                      aria-label={`Clear ${group.label}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        clearGroup(group.slug);
                      }}
                      className="printable-filter-clear flex w-10 shrink-0 cursor-pointer items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150">
                        <X className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroup((current) =>
                        current === group.slug ? null : group.slug,
                      )
                    }
                    className={`relative flex w-10 shrink-0 cursor-pointer items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 ${
                      active
                        ? "before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-px before:bg-[#cbe3d7] before:content-[''] dark:before:bg-emerald-800"
                        : ""
                    }`}
                    aria-label={`${openGroup === group.slug ? "Close" : "Open"} ${group.label} filter`}
                    aria-expanded={openGroup === group.slug}
                  >
                    {openGroup === group.slug ? (
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {openGroup === group.slug && (
                  <div className="absolute left-0 top-full z-30 w-max min-w-full rounded-[14px] border border-slate-200 bg-white p-2 shadow-[0_3px_10px_rgba(15,23,42,0.2)] dark:border-slate-700 dark:bg-slate-900">
                    {group.options.map((option) => {
                      const checked =
                        selected[group.slug]?.includes(option.slug) ?? false;
                      return (
                        <label
                          key={option.id}
                          className="flex min-h-[34px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[10px] px-2 text-[16px] font-normal leading-5 text-slate-700 transition-colors hover:bg-[#f4f4f4] dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              checked
                                ? "border-[#377dff]"
                                : "border-[#9299a1] dark:border-slate-500"
                            }`}
                            aria-hidden="true"
                          >
                            {checked && (
                              <span className="h-2 w-2 rounded-full bg-[#377dff]" />
                            )}
                          </span>
                          <input
                            type="radio"
                            name={`filter-${group.slug}`}
                            checked={checked}
                            onChange={() =>
                              toggleOption(group.slug, option.slug)
                            }
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setOpenGroup(null);
              setAllFiltersOpen(true);
            }}
            className={`inline-flex h-10 min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-[16px] font-bold leading-none text-[#26282f] transition-colors duration-150 dark:text-slate-100 ${
              selectedCount > 0
                ? "printable-filter-pill--active border-[#2fd179] bg-[#e4fff2] dark:border-emerald-500 dark:bg-emerald-950/45"
                : "printable-filter-pill--inactive border-transparent bg-[#f2f2f2] dark:bg-slate-900"
            }`}
          >
            <SlidersVertical className="h-5 w-5" aria-hidden="true" />
            All filters{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </button>
        </div>

        <section className="relative my-8 overflow-hidden rounded-[1.75rem] bg-slate-950 px-6 py-7 text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] md:px-8">
          <div
            className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-pink-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 shadow-lg shadow-orange-950/30">
                  <Crown className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-300">
                  {premiumPlan.title}
                </p>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-100 backdrop-blur">
                  {premiumPlan.badge}
                </span>
              </div>

              <h2 className="mt-4 max-w-2xl text-2xl font-black tracking-tight md:text-3xl">
                One purchase. A full year of printable puzzles.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Unlock every Premium-included PDF today, plus new Premium
                releases added during your access period.
              </p>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-200">
                <span className="inline-flex items-center gap-2">
                  <Download className="h-4 w-4 text-orange-300" aria-hidden="true" />
                  Instant downloads
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-pink-300" aria-hidden="true" />
                  {premiumPlan.accessDays} days of access
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  No auto-renewal
                </span>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
              <div className="text-left sm:text-right lg:text-center">
                <p className="text-xs font-semibold text-slate-400">
                  One-time payment
                </p>
                <p className="text-3xl font-black">
                  {formatPrintablePrice(premiumPlan)}
                </p>
              </div>
              <Link
                href="/printables/premium"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-950/30 transition-all hover:from-orange-400 hover:to-pink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Explore Premium
              </Link>
            </div>
          </div>
        </section>

        {filteredProducts.length ? (
          <section
            aria-label="Printable PDF resources"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredProducts.map((product) => (
              <PrintableCard key={product.slug} product={product} />
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              No printables match these filters
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Clear one or more filters to see more PDF resources.
            </p>
            <button
              type="button"
              onClick={() => navigateToFilters(emptyPrintableFilters())}
              className="mt-5 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white"
            >
              Clear all filters
            </button>
          </section>
        )}
      </div>

      {allFiltersOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/45"
          role="dialog"
          aria-modal="true"
          aria-label="All printable filters"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAllFiltersOpen(false);
            }
          }}
        >
          <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  All filters
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Results update as you select.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAllFiltersOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close all filters"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2">
              {filterGroups.map((group) => (
                <fieldset
                  key={group.slug}
                  className="border-b border-slate-200 py-6 last:border-0 dark:border-slate-800"
                >
                  <legend className="mb-3 font-black text-slate-900 dark:text-white">
                    {group.label}
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {group.options.map((option) => {
                      const checked =
                        selected[group.slug]?.includes(option.slug) ?? false;
                      return (
                        <label
                          key={option.id}
                          className={`flex min-h-13 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-medium transition ${
                            checked
                              ? "bg-[#f4f4f4] text-slate-900 dark:bg-slate-800 dark:text-white"
                              : "text-slate-700 hover:bg-[#f4f4f4] dark:text-slate-200 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                              checked
                                ? "border-[#377dff]"
                                : "border-[#9ca3af] dark:border-slate-500"
                            }`}
                            aria-hidden="true"
                          >
                            {checked && (
                              <span className="h-3 w-3 rounded-full bg-[#377dff]" />
                            )}
                          </span>
                          <input
                            type="radio"
                            name={`all-filter-${group.slug}`}
                            checked={checked}
                            onChange={() =>
                              toggleOption(group.slug, option.slug)
                            }
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-200 p-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigateToFilters(emptyPrintableFilters())}
                className="px-3 py-2 text-sm font-bold text-slate-600 hover:underline dark:text-slate-300"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setAllFiltersOpen(false)}
                className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white"
              >
                Show {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "resource" : "resources"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
