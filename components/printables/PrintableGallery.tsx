"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PrintablePreviewImage } from "@/data/printables";

export default function PrintableGallery({
  images,
  title,
}: {
  images: PrintablePreviewImage[];
  title: string;
}) {
  const galleryImages = images;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[activeIndex];

  if (!activeImage) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900">
        Preview images for {title} are being prepared.
      </div>
    );
  }

  function showPrevious() {
    setActiveIndex((current) =>
      current === 0 ? galleryImages.length - 1 : current - 1,
    );
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % galleryImages.length);
  }

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-[#fbf2e8] via-[#f8f5ed] to-[#eef5e8] dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"
      >
        <div className="relative aspect-[4/5] sm:aspect-[1.12]">
          <Image
            key={activeImage.url}
            src={activeImage.url}
            alt={activeImage.alt}
            fill
            priority={activeIndex === 0}
            className="object-contain p-3 sm:p-5"
            sizes="(max-width: 1024px) 100vw, 52vw"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={showPrevious}
          disabled={galleryImages.length === 1}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-950 transition hover:bg-slate-100 disabled:cursor-default disabled:opacity-30 dark:text-white dark:hover:bg-slate-800"
          aria-label="Show previous preview"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-1 justify-center gap-2 overflow-x-auto p-1 sm:gap-3">
          {galleryImages.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-[#f8f8f6] p-1.5 transition sm:w-20 ${
                activeIndex === index
                  ? "border-orange-500 shadow-[0_4px_14px_rgba(249,115,22,0.16)]"
                  : "border-slate-100 hover:border-orange-200 dark:border-slate-700 dark:bg-slate-800"
              }`}
              aria-label={`Show preview ${index + 1} of ${galleryImages.length}`}
              aria-pressed={activeIndex === index}
            >
              <Image
                src={image.url}
                alt=""
                fill
                className="object-contain p-1.5"
                sizes="80px"
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={showNext}
          disabled={galleryImages.length === 1}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-950 transition hover:bg-slate-100 disabled:cursor-default disabled:opacity-30 dark:text-white dark:hover:bg-slate-800"
          aria-label="Show next preview"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
