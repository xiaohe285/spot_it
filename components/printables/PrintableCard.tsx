import Image from "next/image";
import Link from "next/link";
import { Crown, FileText, Search } from "lucide-react";
import {
  formatPrintablePrice,
  type PrintableProduct,
} from "@/data/printables";

export default function PrintableCard({
  product,
}: {
  product: PrintableProduct;
}) {
  return (
    <Link
      href={`/printables/${product.slug}`}
      aria-label={`View ${product.title}`}
      className="group block h-full rounded-[1.4rem] outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-orange-200 group-hover:shadow-[0_18px_45px_rgba(249,115,22,0.13)] dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-orange-900">
        <div className="relative block aspect-[4/5] overflow-hidden bg-orange-50 dark:bg-slate-800">
          <Image
            src={product.previewImage}
            alt={`Preview of ${product.title}`}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.035]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/35 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-800 shadow-sm backdrop-blur">
            {product.badge}
          </div>
          {product.isPremiumIncluded && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-slate-950/85 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm backdrop-blur">
              <Crown className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              Included with Premium
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col px-4 py-3.5">
          <h2 className="truncate text-[14px] font-extrabold leading-5 text-slate-900 transition-colors group-hover:text-orange-600 dark:text-white">
            {product.title}
          </h2>

          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="shrink-0 text-base font-black text-orange-600 dark:text-orange-400">
              {formatPrintablePrice(product)}
            </span>

            <dl className="flex items-center justify-end gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1">
                <Search className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />
                <span>{product.puzzleCount} puzzles</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-pink-500" aria-hidden="true" />
                <span>{product.totalPages} pages</span>
              </div>
            </dl>
          </div>
        </div>
      </article>
    </Link>
  );
}
