"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import PrintableFileLinks from "@/components/printables/PrintableFileLinks";
import type { PrintableProductFile } from "@/data/printables";

type PremiumReceipt = {
  orderId: string;
  downloadToken: string;
  expiresAt: string;
  accessType?: "premium";
};

export default function PremiumAccessDownload({
  productSlug,
  files,
}: {
  productSlug: string;
  files: PrintableProductFile[];
}) {
  const [receipt, setReceipt] = useState<PremiumReceipt | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("spotdiffs:premium-access");
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as PremiumReceipt;
      if (
        parsed.downloadToken &&
        new Date(parsed.expiresAt).getTime() > Date.now()
      ) {
        queueMicrotask(() => setReceipt(parsed));
      } else {
        window.localStorage.removeItem("spotdiffs:premium-access");
      }
    } catch {
      window.localStorage.removeItem("spotdiffs:premium-access");
    }
  }, []);

  if (!receipt) {
    return null;
  }

  return (
    <div className="mb-5 rounded-[1.15rem] border border-orange-200 bg-orange-50 p-5 dark:border-orange-900 dark:bg-orange-950/30">
      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-orange-100">
        <Sparkles className="h-5 w-5 text-orange-500" aria-hidden="true" />
        Included with your Premium access
      </div>
      <div className="mt-4">
        <PrintableFileLinks
          productSlug={productSlug}
          files={files}
          token={receipt.downloadToken}
          tone="orange"
        />
      </div>
    </div>
  );
}
