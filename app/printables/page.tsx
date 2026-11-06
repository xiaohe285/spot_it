import type { Metadata } from "next";
import PrintablesBrowser from "@/components/printables/PrintablesBrowser";
import { getPrintableCatalog } from "@/lib/db/printables";
import { emptyPrintableFilters } from "@/lib/printableFilters";

const siteUrl = "https://spotdiffs.com";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Printable Spot the Difference PDF Games",
  description:
    "Browse free and premium printable spot the difference PDF worksheets for kids, classrooms, adults, and screen-free family fun.",
  alternates: {
    canonical: `${siteUrl}/printables`,
  },
  openGraph: {
    title: "Printable Spot the Difference PDF Games",
    description:
      "Filter original printable puzzles with answer keys, including free downloads and Premium packs.",
    url: `${siteUrl}/printables`,
    type: "website",
  },
};

export default async function PrintablesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const catalog = await getPrintableCatalog();
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Printable Spot the Difference PDF Games",
    url: `${siteUrl}/printables`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: catalog.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/printables/${product.slug}`,
        name: product.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema).replace(/</g, "\\u003c"),
        }}
      />
      <PrintablesBrowser
        products={catalog.products}
        filterGroups={catalog.filterGroups}
        premiumPlan={catalog.premiumPlan}
        initialSelected={emptyPrintableFilters()}
        initialPage={Number(page)}
      />
    </>
  );
}
