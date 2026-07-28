import "server-only";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

let r2Client: S3Client | null = null;

function getR2Client() {
  if (r2Client) {
    return r2Client;
  }

  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const endpoint =
    process.env.CLOUDFLARE_R2_ENDPOINT ??
    (accountId
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : null);

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return r2Client;
}

function parseR2StoragePath(storagePath: string) {
  const normalizedPath = storagePath.replace(/^\/+/, "");
  const separatorIndex = normalizedPath.indexOf("/");
  if (
    separatorIndex <= 0 ||
    separatorIndex === normalizedPath.length - 1
  ) {
    throw new Error(
      "Invalid R2 storage path. Expected bucket-name/object-key.",
    );
  }

  return {
    bucket: normalizedPath.slice(0, separatorIndex),
    objectKey: normalizedPath.slice(separatorIndex + 1),
  };
}

export async function downloadR2Object(storagePath: string) {
  const { bucket, objectKey } = parseR2StoragePath(storagePath);
  const response = await getR2Client().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
  );

  if (!response.Body) {
    throw new Error("Cloudflare R2 returned an empty object.");
  }

  return Buffer.from(await response.Body.transformToByteArray());
}
