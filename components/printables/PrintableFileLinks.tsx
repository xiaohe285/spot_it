import { Download, FileText } from "lucide-react";
import type { PrintableProductFile } from "@/data/printables";

function formatFileSize(bytes: number | null) {
  if (!bytes) {
    return null;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function buildPrintableFileUrl({
  productSlug,
  fileSlug,
  token,
}: {
  productSlug: string;
  fileSlug: string;
  token?: string;
}) {
  const search = new URLSearchParams({ file: fileSlug });
  if (token) {
    search.set("token", token);
  }
  return `/api/printables/download/${encodeURIComponent(productSlug)}?${search.toString()}`;
}

export default function PrintableFileLinks({
  productSlug,
  files,
  token,
  tone = "orange",
}: {
  productSlug: string;
  files: PrintableProductFile[];
  token?: string;
  tone?: "orange" | "emerald" | "violet";
}) {
  const toneClasses = {
    orange:
      "bg-gradient-to-r from-orange-500 to-pink-500 shadow-orange-200/70 hover:from-orange-600 hover:to-pink-600 dark:shadow-none",
    emerald:
      "bg-emerald-600 shadow-emerald-200/70 hover:bg-emerald-700 dark:shadow-none",
    violet:
      "bg-violet-600 shadow-violet-200/70 hover:bg-violet-700 dark:shadow-none",
  };

  if (!files.length) {
    return (
      <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        Download files are being prepared. Please try again shortly.
      </p>
    );
  }

  return (
    <div className="grid gap-2.5">
      {files.map((file) => {
        const fileSize = formatFileSize(file.fileSizeBytes);
        return (
          <a
            key={file.slug}
            href={buildPrintableFileUrl({
              productSlug,
              fileSlug: file.slug,
              token,
            })}
            className={`flex min-h-12 items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-extrabold text-white shadow-lg transition-all ${toneClasses[tone]}`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Download className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="truncate">Download {file.label}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-white/80">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              PDF{fileSize ? ` · ${fileSize}` : ""}
            </span>
          </a>
        );
      })}
    </div>
  );
}
