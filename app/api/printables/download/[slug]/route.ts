import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  getPrintableProductBySlug,
  getStoredPrintableProductFiles,
  userHasPrintableAccess,
} from "@/lib/db/printables";
import { verifyDownloadAccessToken } from "@/lib/downloadTokens";
import { downloadR2Object } from "@/lib/r2";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await getPrintableProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (product.priceCents === 0) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Log in before downloading this free printable." },
        { status: 401 },
      );
    }
  } else {
    const token = new URL(request.url).searchParams.get("token");
    const hasDatabaseAccess = await userHasPrintableAccess(product);
    if (!token && !hasDatabaseAccess) {
      return NextResponse.json(
        { error: "Payment is required before downloading this file." },
        { status: 403 },
      );
    }

    try {
      const access = token
        ? verifyDownloadAccessToken(token, product.slug)
        : null;
      const tokenAllowsDownload =
        access?.accessType === "product" ||
        (access?.accessType === "premium" && product.isPremiumIncluded);
      if (!tokenAllowsDownload && !hasDatabaseAccess) {
        return NextResponse.json(
          { error: "This download link is invalid or has expired." },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Secure downloads are not configured." },
        { status: 503 },
      );
    }
  }

  try {
    const requestedFileSlug = new URL(request.url).searchParams.get("file");
    const fileRecords = await getStoredPrintableProductFiles(product);
    const fileRecord = requestedFileSlug
      ? fileRecords.find((file) => file.slug === requestedFileSlug)
      : fileRecords.find((file) => file.isPrimary) ?? fileRecords[0];
    if (!fileRecord) {
      if (requestedFileSlug) {
        return NextResponse.json(
          { error: "The requested PDF was not found." },
          { status: 404 },
        );
      }
      throw new Error("Missing product file mappings.");
    }

    let file: Buffer;
    if (fileRecord.storageProvider === "r2") {
      file = await downloadR2Object(fileRecord.storagePath);
    } else if (fileRecord.storageProvider === "supabase") {
      const [bucket, ...objectParts] = fileRecord.storagePath.split("/");
      const objectPath = objectParts.join("/");
      const admin = createAdminClient();
      if (!admin || !bucket || !objectPath) {
        throw new Error("Invalid Supabase storage mapping.");
      }
      const { data, error } = await admin.storage
        .from(bucket)
        .download(objectPath);
      if (error || !data) {
        throw error ?? new Error("Supabase Storage download failed.");
      }
      file = Buffer.from(await data.arrayBuffer());
    } else {
      const printableRoot = path.resolve(
        process.cwd(),
        "private",
        "printables",
      );
      const filePath = path.resolve(process.cwd(), fileRecord.storagePath);
      if (
        filePath !== printableRoot &&
        !filePath.startsWith(`${printableRoot}${path.sep}`)
      ) {
        throw new Error("Unsafe printable file path.");
      }
      file = await readFile(filePath);
    }
    const safeFileName = fileRecord.fileName.replace(/[^a-z0-9._-]/gi, "-");

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"`,
        "Content-Length": String(file.byteLength),
        "Cache-Control":
          product.priceCents === 0
            ? "public, max-age=3600"
            : "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "The PDF file is temporarily unavailable." },
      { status: 503 },
    );
  }
}
