"use client";

import { useState } from "react";
import { Download, LogIn } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import PrintableFileLinks from "@/components/printables/PrintableFileLinks";
import { useAuth } from "@/contexts/AuthContext";
import type { PrintableProductFile } from "@/data/printables";

export default function FreePrintableDownload({
  productSlug,
  files,
  embedded = false,
}: {
  productSlug: string;
  files: PrintableProductFile[];
  embedded?: boolean;
}) {
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <div
        className={
          embedded
            ? ""
            : "rounded-[1.4rem] border border-orange-200 bg-white p-5 shadow-[0_12px_35px_rgba(249,115,22,0.1)] dark:border-orange-900 dark:bg-slate-900"
        }
      >
        {!embedded && (
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Instant digital download
              </p>
              <p className="mt-1 text-4xl font-black text-slate-950 dark:text-white">
                Free
              </p>
            </div>
            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-extrabold text-orange-700 dark:bg-orange-950/50 dark:text-orange-300">
              {user ? "Ready to download" : "Free account required"}
            </span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-12 items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            Checking your account…
          </div>
        ) : user ? (
          <PrintableFileLinks productSlug={productSlug} files={files} />
        ) : (
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200/60 transition hover:from-orange-600 hover:to-pink-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:shadow-none"
          >
            <LogIn className="h-5 w-5" aria-hidden="true" />
            Log in to Download
          </button>
        )}

        {!loading && !user && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Sign in with a free account to access every PDF in this pack.
          </p>
        )}
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode="login"
        onSuccess={() => setAuthOpen(false)}
      />
    </>
  );
}
