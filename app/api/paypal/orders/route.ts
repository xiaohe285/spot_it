import { NextResponse } from "next/server";
import {
  getPrintablePremiumPlanBySlug,
  getPrintableProductBySlug,
} from "@/lib/db/printables";
import {
  createPayPalOrder,
  PayPalError,
  type PayPalSellable,
} from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      purchaseType?: "product" | "premium";
      itemSlug?: string;
      productSlug?: string;
    };
    const purchaseType = body.purchaseType ?? "product";
    const itemSlug = body.itemSlug ?? body.productSlug;
    const product =
      purchaseType === "product" && itemSlug
        ? await getPrintableProductBySlug(itemSlug)
        : null;
    const premiumPlan =
      purchaseType === "premium" && itemSlug
        ? await getPrintablePremiumPlanBySlug(itemSlug)
        : null;

    if ((!product && !premiumPlan) || product?.priceCents === 0) {
      return NextResponse.json(
        { error: "Paid item not found." },
        { status: 404 },
      );
    }

    const item: PayPalSellable = product
      ? {
          purchaseType: "product",
          slug: product.slug,
          title: product.title,
          description: `${product.puzzleCount} printable puzzles with answer keys`,
          priceCents: product.priceCents,
          currency: product.currency,
        }
      : {
          purchaseType: "premium",
          slug: premiumPlan!.slug,
          title: premiumPlan!.title,
          description: premiumPlan!.shortDescription,
          priceCents: premiumPlan!.priceCents,
          currency: premiumPlan!.currency,
        };
    const order = await createPayPalOrder(item);
    return NextResponse.json(
      { id: order.id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const status = error instanceof PayPalError ? error.status : 500;
    const message =
      error instanceof PayPalError
        ? error.message
        : "Unable to create the PayPal order.";
    return NextResponse.json({ error: message }, { status });
  }
}
