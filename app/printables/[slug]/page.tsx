import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Download,
  Equal,
  Eye,
  FileText,
  Focus,
  MonitorOff,
  Plus,
  Printer,
  Puzzle,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
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
    color: "bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300",
  },
  {
    icon: Focus,
    title: "Focus & patience",
    description: "Short, achievable puzzles that build attention.",
    color: "bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300",
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
      "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
  },
];

const printingBenefits = [
  {
    icon: FileText,
    title: "PDF format",
    description: "High-resolution files for crisp prints.",
    color: "text-orange-500",
  },
  {
    icon: Printer,
    title: "US Letter & A4",
    description: "Print the size that works for you.",
    color: "text-blue-500",
  },
  {
    icon: Puzzle,
    title: "Home printer friendly",
    description: "Designed to print easily and clearly.",
    color: "text-emerald-600",
  },
  {
    icon: RefreshCcw,
    title: "Reprint anytime",
    description: "Reuse within the included license.",
    color: "text-violet-600",
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
    {
      title: `${product.puzzleCount} original ${product.puzzleCount === 1 ? "puzzle" : "puzzles"}`,
      description: "Carefully designed and full of details.",
    },
    {
      title: `${product.answerKeyCount} answer ${product.answerKeyCount === 1 ? "key" : "keys"}`,
      description: "All differences clearly marked.",
    },
    {
      title: `${product.totalPages} printable pages`,
      description: "Puzzle pages and answer-key pages.",
    },
    {
      title: `${product.differencesPerPuzzle} differences on every puzzle`,
      description: "A clear and satisfying visual challenge.",
    },
    {
      title: `${product.difficulty} difficulty`,
      description: `Designed for ${product.audience.toLowerCase()}.`,
    },
  ];
  const faqItems = [
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
  ];
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
    <main className="min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-white py-6 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 md:py-9">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-7xl px-4">
        <Link
          href="/printables"
          className="mb-5 inline-flex items-center gap-1 text-sm font-bold text-slate-600 transition-colors hover:text-orange-600 dark:text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          All printables
        </Link>

        <section className="rounded-[1.75rem] border border-orange-100 bg-white p-4 shadow-[0_18px_55px_rgba(249,115,22,0.09)] dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <div className="grid items-start gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
            <div>
              <PrintableGallery
                images={product.previewImages}
                title={product.title}
                badge={`${audienceLabel} printable`}
              />

              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  [Puzzle, `${product.puzzleCount} ${product.puzzleCount === 1 ? "puzzle" : "puzzles"}`],
                  [FileText, `${product.totalPages} pages`],
                  [Check, `${product.answerKeyCount} answer ${product.answerKeyCount === 1 ? "key" : "keys"}`],
                  [Download, "Instant PDF"],
                ].map(([Icon, label]) => (
                  <div
                    key={String(label)}
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2 text-center text-xs font-extrabold text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-orange-500" aria-hidden="true" />
                    <span>{String(label)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-1 py-1 md:px-2 lg:py-3">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-4xl">
                {product.title}
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                {product.shortDescription}
              </p>

              <ul className="mt-6 grid gap-3 text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {[
                  `${product.puzzleCount} colorful ${product.puzzleCount === 1 ? "puzzle" : "puzzles"}`,
                  `${product.answerKeyCount} complete answer ${product.answerKeyCount === 1 ? "key" : "keys"}`,
                  `${product.totalPages} printable pages`,
                  "Instant PDF download",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div id="get-printable" className="mt-6 scroll-mt-24">
                <div className="mb-4">
                  <p className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                    {priceLabel}
                  </p>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
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
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                        <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
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
                          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
                                <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
                                Need more printable activities?
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                                Get {premiumPlan.accessDays}-day access to all printable packs.
                              </p>
                            </div>
                            <Link
                              href="/printables/premium"
                              className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-orange-500 bg-white px-4 py-2 text-xs font-black text-orange-600 transition hover:bg-orange-50 dark:bg-slate-900 dark:hover:bg-slate-800"
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
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-orange-100 bg-white p-6 shadow-[0_10px_35px_rgba(249,115,22,0.05)] dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[240px_repeat(4,minmax(0,1fr))] lg:gap-0">
            <div className="sm:col-span-2 lg:col-span-1 lg:pr-7">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                About this puzzle
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {product.description}
              </p>
            </div>

            {practiceAreas.map(({ icon: Icon, title, description, color }) => (
              <article
                key={title}
                className="flex flex-col items-center px-4 text-center lg:border-l lg:border-slate-200 dark:lg:border-slate-700"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-extrabold text-slate-950 dark:text-white">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="item-details" className="mt-5 scroll-mt-24 rounded-2xl border border-orange-100 bg-white p-6 shadow-[0_10px_35px_rgba(249,115,22,0.05)] dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            What&apos;s included in this download
          </h2>
          <div className="mt-5 grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <ul className="space-y-4">
              {includedItems.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:gap-5">
              {[
                ["Puzzle page", "Puzzle page preview"],
                ["Answer key page", "Answer key preview"],
              ].map(([label, alt], index) => (
                <div key={label} className="contents">
                  {index === 1 && (
                    <Plus className="h-7 w-7 shrink-0 text-slate-900 dark:text-white" aria-label="plus" />
                  )}
                  <figure className="w-32 shrink-0 sm:w-40">
                    <figcaption className="mb-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {label}
                    </figcaption>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-md dark:border-slate-700 dark:bg-slate-800">
                      <Image
                        src={product.previewImage}
                        alt={alt}
                        fill
                        className="object-cover object-top"
                        sizes="160px"
                      />
                    </div>
                  </figure>
                </div>
              ))}

              <Equal className="h-7 w-7 shrink-0 text-slate-900 dark:text-white" aria-label="equals" />
              <div className="flex w-28 shrink-0 flex-col items-center text-center">
                <div className="relative flex h-24 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <FileText className="h-14 w-14 text-slate-300 dark:text-slate-500" aria-hidden="true" />
                  <span className="absolute rounded bg-red-500 px-2 py-1 text-sm font-black text-white">
                    PDF
                  </span>
                </div>
                <p className="mt-3 text-xs font-extrabold leading-5 text-slate-900 dark:text-white">
                  Instant download
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/70 via-white to-pink-50/60 p-6 shadow-[0_10px_35px_rgba(249,115,22,0.05)] dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            Printing made easy
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {printingBenefits.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">
                  <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-orange-100 bg-white p-6 shadow-[0_10px_35px_rgba(249,115,22,0.05)] dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            Frequently asked questions
          </h2>
          <div className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {faqItems.map(([question, answer]) => (
              <details key={question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 text-sm font-extrabold text-slate-800 marker:content-none dark:text-slate-100">
                  {question}
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="px-5 pb-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <p className="mx-auto mt-5 max-w-3xl pb-2 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
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
