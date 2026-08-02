import "server-only";

import { cache } from "react";
import type {
  PrintableFilterGroup,
  PrintableFilterOption,
  PrintableFilterSelectionMode,
  PrintablePremiumPlan,
  PrintableProduct,
  PrintableProductFile,
  PrintablePreviewImage,
  PrintableTitleSlot,
} from "@/data/printables";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type FilterOptionRow = {
  id: string;
  slug: string;
  label: string;
  sort_order: number;
  url_order: number;
  parent_id: string | null;
  title_text: string;
  title_slot: PrintableTitleSlot;
  title_order: number;
  include_parent_url: boolean;
  is_indexable: boolean;
  printable_filter_groups:
    | {
        slug: string;
        label: string;
        display_order: number;
        url_order: number;
        title_order: number;
        selection_mode: PrintableFilterSelectionMode;
      }
    | Array<{
        slug: string;
        label: string;
        display_order: number;
        url_order: number;
        title_order: number;
        selection_mode: PrintableFilterSelectionMode;
      }>
    | null;
};

type ProductFilterRow = {
  printable_filter_options: FilterOptionRow | FilterOptionRow[] | null;
};

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  price_cents: number;
  currency: "USD";
  audience: string;
  difficulty: string;
  puzzle_count: number;
  answer_key_count: number;
  total_pages: number;
  differences_per_puzzle: number;
  preview_image_url: string;
  preview_images: PrintablePreviewImage[];
  badge: string;
  features: string[];
  is_premium_included: boolean;
  sales_count: number;
  published_at: string;
  printable_product_filters?: ProductFilterRow[];
};

type FilterGroupRow = {
  id: string;
  slug: string;
  label: string;
  display_order: number;
  url_order: number;
  title_order: number;
  selection_mode: PrintableFilterSelectionMode;
  printable_filter_options?: Array<{
    id: string;
    slug: string;
    label: string;
    sort_order: number;
    url_order: number;
    parent_id: string | null;
    title_text: string;
    title_slot: PrintableTitleSlot;
    title_order: number;
    include_parent_url: boolean;
    is_indexable: boolean;
  }>;
};

type PremiumPlanRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  price_cents: number;
  currency: "USD";
  access_days: number;
  features: string[];
  badge: string;
};

type ProductFileMetadataRow = {
  download_slug: string;
  display_name: string;
  file_name: string;
  file_size_bytes: number | null;
  is_primary: boolean;
};

export type PrintableCatalog = {
  products: PrintableProduct[];
  filterGroups: PrintableFilterGroup[];
  premiumPlan: PrintablePremiumPlan;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapFilterOption(row: FilterOptionRow): PrintableFilterOption | null {
  const group = firstRelation(row.printable_filter_groups);
  if (!group) {
    return null;
  }
  return {
    id: row.id,
    groupSlug: group.slug,
    groupLabel: group.label,
    slug: row.slug,
    label: row.label,
    sortOrder: row.sort_order,
    urlOrder: row.url_order,
    parentId: row.parent_id,
    titleText: row.title_text,
    titleSlot: row.title_slot,
    titleOrder: row.title_order,
    includeParentUrl: row.include_parent_url,
    isIndexable: row.is_indexable,
  };
}

function mapProduct(row: ProductRow): PrintableProduct {
  const filterOptions = (row.printable_product_filters ?? [])
    .flatMap((link) => {
      const relation = link.printable_filter_options;
      return Array.isArray(relation) ? relation : relation ? [relation] : [];
    })
    .map(mapFilterOption)
    .filter((item): item is PrintableFilterOption => Boolean(item));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    audience: row.audience,
    difficulty: row.difficulty,
    puzzleCount: row.puzzle_count,
    answerKeyCount: row.answer_key_count,
    totalPages: row.total_pages,
    differencesPerPuzzle: row.differences_per_puzzle,
    previewImage: row.preview_image_url,
    previewImages: row.preview_images?.length
      ? row.preview_images
      : [
          {
            url: row.preview_image_url,
            alt: `Preview of ${row.title}`,
          },
        ],
    badge: row.badge,
    features: row.features ?? [],
    isPremiumIncluded: row.is_premium_included,
    salesCount: row.sales_count,
    publishedAt: row.published_at,
    filterOptions,
  };
}

function mapFilterGroup(row: FilterGroupRow): PrintableFilterGroup {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    displayOrder: row.display_order,
    urlOrder: row.url_order,
    titleOrder: row.title_order,
    selectionMode: row.selection_mode,
    options: (row.printable_filter_options ?? [])
      .map((item) => ({
        id: item.id,
        groupSlug: row.slug,
        groupLabel: row.label,
        slug: item.slug,
        label: item.label,
        sortOrder: item.sort_order,
        urlOrder: item.url_order,
        parentId: item.parent_id,
        titleText: item.title_text,
        titleSlot: item.title_slot,
        titleOrder: item.title_order,
        includeParentUrl: item.include_parent_url,
        isIndexable: item.is_indexable,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

function mapPremiumPlan(row: PremiumPlanRow): PrintablePremiumPlan {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    accessDays: row.access_days,
    features: row.features ?? [],
    badge: row.badge,
  };
}

export const getPrintableCatalog = cache(async (): Promise<PrintableCatalog> => {
  const supabase = await createClient();
  const [productsResult, groupsResult, planResult] = await Promise.all([
    supabase
      .from("printable_products")
      .select(
        `
            id, slug, title, short_description, description, price_cents,
            currency, audience, difficulty, puzzle_count, answer_key_count,
            total_pages, differences_per_puzzle, preview_image_url,
            preview_images, badge,
            features, is_premium_included, sales_count,
            published_at,
            printable_product_filters (
              printable_filter_options (
                id, slug, label, sort_order, url_order, parent_id,
                title_text, title_slot, title_order, include_parent_url,
                is_indexable,
                printable_filter_groups (
                  slug, label, display_order, url_order, title_order,
                  selection_mode
                )
              )
            )
        `,
      )
      .eq("published", true)
      .order("published_at", { ascending: false })
      .order("display_order", { ascending: true }),
    supabase
      .from("printable_filter_groups")
      .select(
        `
            id, slug, label, display_order, url_order, title_order,
            selection_mode,
            printable_filter_options (
              id, slug, label, sort_order, url_order, parent_id, title_text,
              title_slot, title_order, include_parent_url, is_indexable
            )
        `,
      )
      .eq("published", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("printable_premium_plans")
      .select(
        `
            id, slug, title, short_description, description, price_cents,
            currency, access_days, features, badge
        `,
      )
      .eq("active", true)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  if (productsResult.error) {
    throw new Error(
      `Unable to load printable products: ${productsResult.error.message}`,
    );
  }
  if (groupsResult.error) {
    throw new Error(
      `Unable to load printable filters: ${groupsResult.error.message}`,
    );
  }
  if (planResult.error) {
    throw new Error(
      `Unable to load the Premium plan: ${planResult.error.message}`,
    );
  }
  if (!groupsResult.data?.length || !planResult.data) {
    throw new Error(
      "The printable catalog requires published filter groups and an active Premium plan.",
    );
  }

  return {
    products: (productsResult.data as unknown as ProductRow[]).map(mapProduct),
    filterGroups: (groupsResult.data as unknown as FilterGroupRow[]).map(
      mapFilterGroup,
    ),
    premiumPlan: mapPremiumPlan(planResult.data as PremiumPlanRow),
  };
});

export async function getPrintableProductBySlug(slug: string) {
  const catalog = await getPrintableCatalog();
  return catalog.products.find((product) => product.slug === slug) ?? null;
}

export async function getPrintablePremiumPlanBySlug(slug: string) {
  const catalog = await getPrintableCatalog();
  return catalog.premiumPlan.slug === slug ? catalog.premiumPlan : null;
}

type StoredPrintableProductFile = PrintableProductFile & {
  storageProvider: "local" | "supabase" | "r2";
  storagePath: string;
};

export async function getPrintableProductFiles(
  product: PrintableProduct,
): Promise<PrintableProductFile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "get_printable_product_file_metadata",
    {
      target_product_id: product.id,
    },
  );

  if (error) {
    throw new Error(
      `Unable to load printable file metadata: ${error.message}`,
    );
  }

  return ((data ?? []) as ProductFileMetadataRow[]).map((row) => ({
    slug: row.download_slug,
    label: row.display_name,
    fileName: row.file_name,
    fileSizeBytes: row.file_size_bytes,
    isPrimary: row.is_primary,
  }));
}

export async function getStoredPrintableProductFiles(
  product: PrintableProduct,
): Promise<StoredPrintableProductFile[]> {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required to read protected printable file mappings.",
    );
  }

  const { data, error } = await admin
    .from("printable_product_files")
    .select(
      `
          download_slug, display_name, file_name, file_size_bytes, is_primary,
          storage_provider, storage_path, sort_order
      `,
    )
    .eq("product_id", product.id)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(
      `Unable to load protected printable file mappings: ${error.message}`,
    );
  }

  return (data ?? []).map((row) => ({
    slug: row.download_slug as string,
    label: row.display_name as string,
    fileName: row.file_name as string,
    fileSizeBytes: row.file_size_bytes as number | null,
    isPrimary: row.is_primary as boolean,
    storageProvider: row.storage_provider as
      | "local"
      | "supabase"
      | "r2",
    storagePath: row.storage_path as string,
  }));
}

export async function userHasPrintableAccess(product: PrintableProduct) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }

    const { data: productOrders, error: productError } = await supabase
      .from("printable_orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .eq("purchase_type", "product")
      .eq("product_id", product.id)
      .limit(1);

    if (!productError && productOrders?.length) {
      return true;
    }
    if (!product.isPremiumIncluded) {
      return false;
    }

    const { data: premiumOrders, error: premiumError } = await supabase
      .from("printable_orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .eq("purchase_type", "premium")
      .gt("access_expires_at", new Date().toISOString())
      .limit(1);

    return !premiumError && Boolean(premiumOrders?.length);
  } catch {
    return false;
  }
}

export type CompletedPrintableOrder = {
  purchaseType: "product" | "premium";
  product?: PrintableProduct;
  premiumPlan?: PrintablePremiumPlan;
  paypalOrderId: string;
  paypalCaptureId: string;
  payerEmail?: string;
  amountCents: number;
  currency: string;
  accessExpiresAt?: string;
};

export async function recordCompletedPrintableOrder(
  order: CompletedPrintableOrder,
) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required before PayPal checkout can be enabled.",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await admin.from("printable_orders").upsert(
    {
      user_id: user?.id ?? null,
      product_id: order.product?.id ?? null,
      premium_plan_id: order.premiumPlan?.id ?? null,
      purchase_type: order.purchaseType,
      paypal_order_id: order.paypalOrderId,
      paypal_capture_id: order.paypalCaptureId,
      payer_email: order.payerEmail ?? null,
      amount_cents: order.amountCents,
      currency: order.currency,
      status: "completed",
      access_expires_at: order.accessExpiresAt ?? null,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "paypal_order_id" },
  );

  if (error) {
    throw new Error(`Unable to record completed printable order: ${error.message}`);
  }
}
