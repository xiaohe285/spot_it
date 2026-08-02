import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

const PRODUCT_TOKEN_LIFETIME_SECONDS = 30 * 24 * 60 * 60;

type LegacyDownloadTokenPayload = {
  version: 1;
  productSlug: string;
  orderId: string;
  expiresAt: number;
};

export type DownloadAccessTokenPayload =
  | {
      version: 2;
      accessType: "product";
      productSlug: string;
      orderId: string;
      expiresAt: number;
    }
  | {
      version: 2;
      accessType: "premium";
      planSlug: string;
      orderId: string;
      expiresAt: number;
    };

function getSecret() {
  const secret = process.env.PAYPAL_DOWNLOAD_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "PAYPAL_DOWNLOAD_SECRET must be configured with at least 32 characters.",
    );
  }
  return secret;
}

function signatureFor(encodedPayload: string) {
  return createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createDownloadToken(productSlug: string, orderId: string) {
  const payload: DownloadAccessTokenPayload = {
    version: 2,
    accessType: "product",
    productSlug,
    orderId,
    expiresAt:
      Math.floor(Date.now() / 1000) + PRODUCT_TOKEN_LIFETIME_SECONDS,
  };
  return signPayload(payload);
}

export function createPremiumAccessToken(
  planSlug: string,
  orderId: string,
  accessDays: number,
) {
  const payload: DownloadAccessTokenPayload = {
    version: 2,
    accessType: "premium",
    planSlug,
    orderId,
    expiresAt:
      Math.floor(Date.now() / 1000) + accessDays * 24 * 60 * 60,
  };
  return signPayload(payload);
}

function signPayload(payload: DownloadAccessTokenPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = signatureFor(encodedPayload);

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.expiresAt * 1000).toISOString(),
  };
}

export function verifyDownloadAccessToken(
  token: string,
  expectedProductSlug: string,
) {
  const [encodedPayload, suppliedSignature] = token.split(".");
  if (!encodedPayload || !suppliedSignature) {
    return null;
  }

  const expectedSignature = signatureFor(encodedPayload);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as DownloadAccessTokenPayload | LegacyDownloadTokenPayload;

    if (
      payload.expiresAt <= Math.floor(Date.now() / 1000) ||
      !payload.orderId
    ) {
      return null;
    }

    if (payload.version === 1) {
      return payload.productSlug === expectedProductSlug
        ? {
            ...payload,
            accessType: "product" as const,
          }
        : null;
    }

    if (payload.version !== 2) {
      return null;
    }

    if (
      payload.accessType === "product" &&
      payload.productSlug !== expectedProductSlug
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
