import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  BusFront,
  Check,
  ChevronDown,
  ChevronLeft,
  CloudRain,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Files,
  Focus,
  Home,
  MonitorOff,
  Printer,
  Puzzle,
  RefreshCcw,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react";
import FreePrintableDownload from "@/components/printables/FreePrintableDownload";
import PayPalCheckout from "@/components/printables/PayPalCheckout";
import PremiumAccessDownload from "@/components/printables/PremiumAccessDownload";
import PrintableFileLinks from "@/components/printables/PrintableFileLinks";
import PrintableGallery from "@/components/printables/PrintableGallery";
import { formatPrintablePrice } from "@/data/printables";
import {
  getPrintableCatalog,
  getPrintableProductBySlug,
  getPrintableProductFiles,
  userHasPrintableAccess,
} from "@/lib/db/printables";

const siteUrl = "https://spotdiffs.com";

const practiceAreas = [
  {
    icon: Eye,
    title: "Observation skills",
    description: "Compare shapes, colors, positions, and tiny details.",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  },
  {
    icon: Focus,
    title: "Focus & patience",
    description: "Short, achievable puzzles that build attention.",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  },
  {
    icon: MonitorOff,
    title: "Screen-free play",
    description: "A calm activity for home, travel, and quiet time.",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  {
    icon: Star,
    title: "Confidence",
    description: "Clear challenges create satisfying, independent wins.",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  },
];

const useCases = [
  { icon: Home, label: "Quiet time at home", color: "text-emerald-600" },
  { icon: School, label: "Classroom activities", color: "text-rose-500" },
  { icon: BusFront, label: "Road trips & flights", color: "text-blue-600" },
  { icon: BookOpen, label: "Homeschool lessons", color: "text-indigo-600" },
  { icon: CloudRain, label: "Rainy-day fun", color: "text-sky-600" },
  { icon: Utensils, label: "Restaurant activity bag", color: "text-orange-600" },
];

const printingBenefits = [
  {
    icon: FileText,
    title: "PDF format",
    description: "High-resolution files made for crisp prints",
  },
  {
    icon: Files,
    title: "Works with US Letter and A4",
    description: "Print the paper size that works for you",
  },
  {
    icon: Printer,
    title: "Home-printer friendly",
    description: "Designed to print cleanly and clearly",
  },
  {
    icon: RefreshCcw,
    title: "Reprint for personal use",
    description: "Use the pack again within its included license",
  },
];

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPrintableProductBySlug(slug);
  if (!product) {
    return {};
  }

  return {
    title: `${product.title} - Printable PDF`,
    description: product.shortDescription,
    alternates: {
      canonical: `${siteUrl}/printables/${product.slug}`,
    },
    openGraph: {
      title: `${product.title} - Printable PDF`,
      description: product.shortDescription,
      url: `${siteUrl}/printables/${product.slug}`,
      type: "website",
      images: product.previewImages.map((image) => ({
        url: image.url,
        alt: image.alt,
      })),
    },
  };
}

export default async function PrintableProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPrintableProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const [{ premiumPlan }, storedFiles] = await Promise.all([
    getPrintableCatalog(),
    getPrintableProductFiles(product),
  ]);
  const downloadFiles = storedFiles.map(
    ({ slug: fileSlug, label, fileName, fileSizeBytes, isPrimary }) => ({
      slug: fileSlug,
      label,
      fileName,
      fileSizeBytes,
      isPrimary,
    }),
  );
  const hasDatabaseAccess =
    product.priceCents > 0 ? await userHasPrintableAccess(product) : false;
  const priceLabel = formatPrintablePrice(product);
  const pricePerPuzzle =
    product.priceCents > 0
      ? `$${(product.priceCents / product.puzzleCount / 100).toFixed(2)} per puzzle`
      : "Free account required";
  const audienceLabel =
    product.filterOptions.find((option) => option.groupSlug === "audience")
      ?.label ?? product.audience;
  const includedItems = [
    `${product.puzzleCount} original puzzles`,
    `${product.answerKeyCount} answer-key pages`,
    `${product.differencesPerPuzzle} differences on every puzzle`,
    ...product.features,
    `${product.difficulty} difficulty`,
  ].filter((item, index, items) => items.indexOf(item) === index);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    image: product.previewImages.map((image) => `${siteUrl}${image.url}`),
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "SpotDiffs",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/printables/${product.slug}`,
      priceCurrency: product.currency,
      price: (product.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/70 via-white to-white py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-7xl px-4">
        <Link
          href="/printables"
          className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-slate-600 transition-colors hover:text-orange-600 dark:text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          All printables
        </Link>

        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(400px,0.9fr)] xl:gap-8">
          <section
            aria-label="Printable previews"
            className="flex h-full flex-col rounded-[2rem] border border-orange-100 bg-white p-4 shadow-[0_24px_70px_rgba(249,115,22,0.08)] dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <PrintableGallery
              images={product.previewImages}
              title={product.title}
            />

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [Puzzle, product.audience],
                [Focus, `${product.puzzleCount} puzzles`],
                [FileText, `${product.totalPages} pages`],
                [Download, "Instant PDF"],
              ].map(([Icon, label]) => (
                <div
                  key={String(label)}
                  className="flex min-h-13 items-center justify-center gap-2 rounded-full border border-orange-100 bg-orange-50/60 px-3 py-2 text-center text-sm font-extrabold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <Icon className="h-5 w-5 shrink-0 text-orange-500 dark:text-orange-400" aria-hidden="true" />
                  <span>{String(label)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="flex h-full flex-col rounded-[2rem] border border-orange-100 bg-white p-6 shadow-[0_24px_70px_rgba(249,115,22,0.08)] dark:border-slate-800 dark:bg-slate-900 md:p-8 lg:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400 sm:text-sm">
              {audienceLabel} printable · {product.audience}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl md:leading-[1.08]">
              {product.title}
            </h1>
            <p className="mt-3 text-base font-bold text-emerald-600 dark:text-emerald-400 sm:text-lg">
              From the {product.title} collection
            </p>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              {product.shortDescription}
            </p>

            <ul className="mt-6 grid gap-x-7 gap-y-4 text-base font-extrabold text-slate-900 dark:text-slate-100 sm:grid-cols-2">
              {[
                `${product.puzzleCount} colorful puzzles`,
                `${product.totalPages} printable pages`,
                `${product.answerKeyCount} complete answer keys`,
                "Instant PDF delivery",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div
              id="get-printable"
              className="mt-10 scroll-mt-24"
            >
              <div className="mb-6">
                <p className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                  {priceLabel}
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
                  {product.priceCents > 0 ? (
                    <>
                      One-time purchase · No subscription
                      <br />
                      {pricePerPuzzle}
                    </>
                  ) : (
                    "Instant digital download · Sign in with a free account"
                  )}
                </p>
              </div>

              {product.priceCents === 0 ? (
                <FreePrintableDownload
                  productSlug={product.slug}
                  files={downloadFiles}
                  embedded
                />
              ) : (
                <div className="space-y-4">
                  {product.isPremiumIncluded && (
                    <PremiumAccessDownload
                      productSlug={product.slug}
                      files={downloadFiles}
                    />
                  )}
                  {hasDatabaseAccess ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
                      <div className="mb-4 flex items-center gap-2 font-extrabold text-emerald-900 dark:text-emerald-200">
                        <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                        Your purchased files are ready
                      </div>
                      <PrintableFileLinks
                        productSlug={product.slug}
                        files={downloadFiles}
                        tone="emerald"
                      />
                    </div>
                  ) : (
                    <>
                      <PayPalCheckout
                        purchaseType="product"
                        itemSlug={product.slug}
                        priceLabel={priceLabel}
                        downloadFiles={downloadFiles}
                        embedded
                      />
                      {product.isPremiumIncluded && (
                        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-5 dark:border-slate-700 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="flex items-start gap-2 text-base font-black leading-5 text-slate-950 dark:text-white">
                              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                              Need more printable activities?
                            </p>
                            <p className="mt-2 max-w-64 text-sm font-medium leading-5 text-slate-600 dark:text-slate-300">
                              SpotDiffs Premium gives {premiumPlan.accessDays}-day access to all printable packs.
                            </p>
                          </div>
                          <Link
                            href="/printables/premium"
                            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border-2 border-orange-500 bg-white px-5 py-3 text-sm font-black text-orange-600 transition hover:bg-orange-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                          >
                            Compare Premium
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <section
          aria-label="Download benefits"
          className="mt-6 grid overflow-hidden rounded-2xl border border-orange-100 bg-white px-4 py-2 shadow-[0_12px_35px_rgba(249,115,22,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            [Download, "Instant download", "Get your files right away"],
            [Printer, "Print at home", "Use your home printer"],
            [BadgeCheck, "Answer keys included", "Check answers with ease"],
            [FileCheck2, "US Letter & A4 friendly", "Print the size you need"],
          ].map(([Icon, title, description], index) => (
            <div
              key={String(title)}
              className={`flex min-h-20 items-center justify-center gap-4 px-5 py-4 ${
                index === 1
                  ? "border-t border-slate-200 dark:border-slate-800 sm:border-l sm:border-t-0"
                  : index === 2
                    ? "border-t border-slate-200 dark:border-slate-800 lg:border-l lg:border-t-0"
                    : index === 3
                      ? "border-t border-slate-200 dark:border-slate-800 sm:border-l lg:border-t-0"
                      : ""
              }`}
            >
              <Icon className="h-7 w-7 shrink-0 text-orange-500 dark:text-orange-400" aria-hidden="true" />
              <div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white">
                  {String(title)}
                </p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {String(description)}
                </p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-center text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            What this pack helps practice
          </h2>
          <div className="mx-auto mt-5 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {practiceAreas.map(({ icon: Icon, title, description, color }) => (
              <article
                key={title}
                className="flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-center text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            Perfect for
          </h2>
          <div className="mx-auto mt-4 grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {useCases.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex min-h-16 items-center justify-center gap-3 rounded-xl border border-orange-100 bg-white px-3 py-3 text-center text-xs font-extrabold leading-5 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <Icon className={`h-6 w-6 shrink-0 ${color}`} aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="item-details"
          className="mt-12 grid scroll-mt-24 gap-4 lg:grid-cols-[1.3fr_0.7fr]"
        >
          <article className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-7">
            <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
              Everything included
            </h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-[0.8fr_1.2fr]">
              <div
                className={`grid gap-2 ${
                  product.previewImages.length > 1 ? "grid-cols-2" : ""
                }`}
              >
                {product.previewImages.slice(0, 6).map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className={`relative aspect-[4/5] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 ${
                      product.previewImages.length === 3 && index === 0
                        ? "row-span-2"
                        : ""
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 50vw, 240px"
                    />
                  </div>
                ))}
              </div>

              <ul className="divide-y divide-orange-100 dark:divide-slate-800">
                {includedItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {item}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Ready to print, easy to use, and clearly organized.
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-xl bg-orange-50/70 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {product.description}
            </div>
          </article>

          <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <section className="p-5 md:p-7">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Printing made easy
              </h2>
              <ul className="mt-5 space-y-4">
                {printingBenefits.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {title}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-orange-100 p-5 dark:border-slate-800 md:p-7">
              <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                Frequently asked questions
              </h2>
              <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                {[
                  [
                    "Is this a physical product?",
                    "No. This is a digital PDF download, and nothing will be shipped.",
                  ],
                  [
                    "How do I receive the files?",
                    product.priceCents === 0
                      ? "Log in with a free account and use the download links shown on this page."
                      : "Your secure download links appear as soon as PayPal confirms payment.",
                  ],
                  [
                    "Can I print the pages more than once?",
                    "Yes, for personal use in one household or according to the classroom license included with the pack.",
                  ],
                  [
                    "Are answer keys included?",
                    `Yes. This pack includes ${product.answerKeyCount} answer-key pages.`,
                  ],
                ].map(([question, answer]) => (
                  <details key={question} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-extrabold text-slate-800 marker:content-none dark:text-slate-100">
                      {question}
                      <ChevronDown
                        className="h-4 w-4 shrink-0 transition group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="px-4 pb-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="relative mt-6 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 px-6 py-6 dark:border-orange-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 md:px-10">
          <div className="pointer-events-none absolute -left-8 -top-10 h-32 w-32 rounded-full bg-orange-200/45 blur-2xl dark:bg-orange-900/20" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Ready for a screen-free activity?
              </p>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                Get all {product.puzzleCount} puzzles{" "}
                {product.priceCents > 0 ? `for ${priceLabel}.` : "for free."}
              </p>
            </div>
            <a
              href="#get-printable"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-200/60 transition hover:from-orange-600 hover:to-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:shadow-none"
            >
              {product.priceCents === 0
                ? "Get the Free Printable Pack"
                : `Get the Printable Pack — ${priceLabel}`}
              <Download className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </section>

        <p className="mx-auto mt-6 max-w-3xl pb-2 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
          Digital product only; no physical item is shipped. By downloading, you
          agree to the{" "}
          <Link href="/terms" className="underline hover:text-orange-600">
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/refund-policy"
            className="underline hover:text-orange-600"
          >
            Digital Delivery &amp; Refund Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
