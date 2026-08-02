import type { Metadata } from "next";
import {
  notFound,
  permanentRedirect,
  redirect,
} from "next/navigation";
import PrintablesBrowser from "@/components/printables/PrintablesBrowser";
import { getPrintableCatalog } from "@/lib/db/printables";
import {
  buildPrintableBrowseDescription,
  buildPrintableBrowsePath,
  buildPrintableBrowseTitle,
  filterPrintableProducts,
  parsePrintableFilterSegments,
  printableFiltersAreIndexable,
  serializePrintableFilters,
} from "@/lib/printableFilters";

const siteUrl = "https://spotdiffs.com";

export const dynamic = "force-dynamic";

type BrowsePageProps = {
  params: Promise<{ segments?: string[] }>;
};

async function getBrowsePageState(params: BrowsePageProps["params"]) {
  const [{ segments = [] }, catalog] = await Promise.all([
    params,
    getPrintableCatalog(),
  ]);
  const parsed = parsePrintableFilterSegments(
    segments,
    catalog.filterGroups,
  );
  const canonicalSegments = serializePrintableFilters(
    parsed.selected,
    catalog.filterGroups,
  );
  const canonicalPath = buildPrintableBrowsePath(
    parsed.selected,
    catalog.filterGroups,
  );

  return {
    catalog,
    segments,
    parsed,
    canonicalSegments,
    canonicalPath,
    title: buildPrintableBrowseTitle(
      parsed.selected,
      catalog.filterGroups,
    ),
  };
}

export async function generateMetadata({
  params,
}: BrowsePageProps): Promise<Metadata> {
  const state = await getBrowsePageState(params);
  if (state.parsed.unknownSegments.length) {
    return {
      title: "Printable Filter Not Found",
      robots: { index: false, follow: false },
    };
  }

  const description = buildPrintableBrowseDescription(state.title);
  const canonical = `${siteUrl}${state.canonicalPath}`;
  const indexable = printableFiltersAreIndexable(
    state.parsed.selected,
    state.catalog.filterGroups,
  );

  return {
    title: state.title,
    description,
    alternates: { canonical },
    robots: {
      index: indexable,
      follow: true,
    },
    openGraph: {
      title: state.title,
      description,
      url: canonical,
      type: "website",
    },
  };
}

export default async function PrintableBrowsePage({
  params,
}: BrowsePageProps) {
  const state = await getBrowsePageState(params);

  if (!state.segments.length) {
    redirect("/printables");
  }
  if (state.parsed.unknownSegments.length) {
    notFound();
  }

  const incomingSegments = state.segments.map((segment) =>
    segment.toLowerCase(),
  );
  if (
    incomingSegments.length !== state.canonicalSegments.length ||
    incomingSegments.some(
      (segment, index) => segment !== state.canonicalSegments[index],
    )
  ) {
    permanentRedirect(state.canonicalPath);
  }

  const matchingProducts = filterPrintableProducts(
    state.catalog.products,
    state.parsed.selected,
  );
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: state.title,
    url: `${siteUrl}${state.canonicalPath}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: matchingProducts.length,
      itemListElement: matchingProducts.map((product, index) => ({
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
        products={state.catalog.products}
        filterGroups={state.catalog.filterGroups}
        premiumPlan={state.catalog.premiumPlan}
        initialSelected={state.parsed.selected}
      />
    </>
  );
}
