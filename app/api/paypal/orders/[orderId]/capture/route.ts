import { NextResponse } from "next/server";
import {
  getPrintablePremiumPlanBySlug,
  getPrintableProductBySlug,
  recordCompletedPrintableOrder,
} from "@/lib/db/printables";
import {
  createDownloadToken,
  createPremiumAccessToken,
} from "@/lib/downloadTokens";
import {
  capturePayPalOrder,
  PayPalError,
  type PayPalSellable,
} from "@/lib/paypal";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    if (!/^[A-Z0-9]+$/i.test(orderId)) {
      return NextResponse.json(
        { error: "Invalid PayPal order." },
        { status: 400 },
      );
    }

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
    const captured = await capturePayPalOrder(orderId, item);
    const accessExpiresAt = premiumPlan
      ? new Date(
          Date.now() + premiumPlan.accessDays * 24 * 60 * 60 * 1000,
        ).toISOString()
      : undefined;

    let orderRecorded = true;
    try {
      await recordCompletedPrintableOrder({
        purchaseType,
        product: product ?? undefined,
        premiumPlan: premiumPlan ?? undefined,
        paypalOrderId: orderId,
        paypalCaptureId: captured.captureId,
        payerEmail: captured.payerEmail,
        amountCents: item.priceCents,
        currency: item.currency,
        accessExpiresAt,
      });
    } catch (error) {
      orderRecorded = false;
      console.error(
        "PayPal payment was captured, but the printable order could not be recorded.",
        error,
      );
    }

    const download = product
      ? createDownloadToken(product.slug, orderId)
      : createPremiumAccessToken(
          premiumPlan!.slug,
          orderId,
          premiumPlan!.accessDays,
        );

    return NextResponse.json(
      {
        orderId,
        downloadToken: download.token,
        expiresAt: download.expiresAt,
        accessType: purchaseType,
        orderRecorded,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const status = error instanceof PayPalError ? error.status : 500;
    const message =
      error instanceof PayPalError
        ? error.message
        : "Unable to confirm the PayPal payment.";
    return NextResponse.json({ error: message }, { status });
  }
}
