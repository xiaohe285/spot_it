import "server-only";

import { randomUUID } from "node:crypto";
export type PayPalSellable = {
  purchaseType: "product" | "premium";
  slug: string;
  title: string;
  description: string;
  priceCents: number;
  currency: "USD";
};

type PayPalOrder = {
  id: string;
  status: string;
  payer?: {
    email_address?: string;
  };
  purchase_units?: Array<{
    custom_id?: string;
    amount?: {
      currency_code?: string;
      value?: string;
    };
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: {
          currency_code?: string;
          value?: string;
        };
      }>;
    };
  }>;
};

export class PayPalError extends Error {
  constructor(
    message: string,
    public status = 500,
  ) {
    super(message);
  }
}

function getCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new PayPalError("PayPal checkout is not configured.", 503);
  }
  return { clientId, clientSecret };
}

export function getPayPalPublicConfig() {
  const downloadSecret = process.env.PAYPAL_DOWNLOAD_SECRET;
  return {
    enabled: Boolean(
      process.env.PAYPAL_CLIENT_ID &&
        process.env.PAYPAL_CLIENT_SECRET &&
        downloadSecret &&
        downloadSecret.length >= 32 &&
        process.env.SUPABASE_SERVICE_ROLE_KEY,
    ),
    clientId: process.env.PAYPAL_CLIENT_ID ?? "",
    currency: "USD",
    mode: process.env.PAYPAL_MODE === "live" ? "live" : "sandbox",
  };
}

function getPayPalBaseUrl() {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const { clientId, clientSecret } = getCredentials();
  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new PayPalError("Unable to connect to PayPal.", 502);
  }

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) {
    throw new PayPalError("PayPal did not return an access token.", 502);
  }
  return body.access_token;
}

async function paypalRequest<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": randomUUID(),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as T & {
    message?: string;
  };
  if (!response.ok) {
    throw new PayPalError(body.message || "PayPal request failed.", 502);
  }
  return body;
}

function expectedPrice(item: PayPalSellable) {
  return (item.priceCents / 100).toFixed(2);
}

function assertOrderMatchesItem(
  order: PayPalOrder,
  item: PayPalSellable,
) {
  const purchaseUnit = order.purchase_units?.[0];
  if (
    !purchaseUnit ||
    purchaseUnit.custom_id !== `${item.purchaseType}:${item.slug}` ||
    purchaseUnit.amount?.currency_code !== item.currency ||
    purchaseUnit.amount?.value !== expectedPrice(item)
  ) {
    throw new PayPalError("PayPal order does not match this purchase.", 400);
  }
}

export async function createPayPalOrder(item: PayPalSellable) {
  if (item.priceCents <= 0) {
    throw new PayPalError("Free products do not require a PayPal order.", 400);
  }

  const price = expectedPrice(item);
  return paypalRequest<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: item.slug,
          custom_id: `${item.purchaseType}:${item.slug}`,
          description: item.description,
          amount: {
            currency_code: item.currency,
            value: price,
            breakdown: {
              item_total: {
                currency_code: item.currency,
                value: price,
              },
            },
          },
          items: [
            {
              name: item.title,
              description:
                item.purchaseType === "premium"
                  ? "31-day printable PDF access"
                  : "Printable PDF digital download",
              sku: `${item.purchaseType}:${item.slug}`,
              quantity: "1",
              category: "DIGITAL_GOODS",
              unit_amount: {
                currency_code: item.currency,
                value: price,
              },
            },
          ],
        },
      ],
    }),
  });
}

export async function capturePayPalOrder(
  orderId: string,
  item: PayPalSellable,
) {
  const order = await paypalRequest<PayPalOrder>(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    { method: "GET" },
  );
  assertOrderMatchesItem(order, item);

  const captured = await paypalRequest<PayPalOrder>(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      body: "{}",
    },
  );
  assertOrderMatchesItem(captured, item);

  const capture = captured.purchase_units?.[0]?.payments?.captures?.[0];
  if (
    captured.status !== "COMPLETED" ||
    capture?.status !== "COMPLETED" ||
    capture.amount?.currency_code !== item.currency ||
    capture.amount?.value !== expectedPrice(item)
  ) {
    throw new PayPalError("Payment was not completed.", 409);
  }

  return {
    order: captured,
    captureId: capture.id ?? orderId,
    payerEmail: captured.payer?.email_address,
  };
}
