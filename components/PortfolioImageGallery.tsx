"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import UploadedImage from "@/components/UploadedImage";
import { normalizeMediaPath } from "@/lib/media-url";

export default function PortfolioImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const normalized = useMemo(
    () => images.map((u) => normalizeMediaPath(String(u))).filter(Boolean),
    [images]
  );

  const close = useCallback(() => setOpen(false), []);
  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + normalized.length) % normalized.length);
    },
    [normalized.length]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go]);

  if (normalized.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {normalized.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg border border-transparent text-left transition hover:border-gold/40 focus:border-gold focus:outline-none"
          >
            <UploadedImage
              src={img}
              alt={`${title} - صورة ${i + 1}`}
              width={600}
              height={450}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white/90 opacity-0 transition group-hover:opacity-100">
              تكبير
            </span>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="معرض الصور"
          onClick={close}
        >
          <button
            type="button"
            className="absolute left-4 top-4 z-[102] rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            onClick={close}
          >
            إغلاق
          </button>
          {normalized.length > 1 && (
            <>
              <button
                type="button"
                className="absolute right-4 top-1/2 z-[102] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label="السابق"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute left-4 top-1/2 z-[102] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label="التالي"
              >
                ›
              </button>
            </>
          )}
          <div className="max-h-[90vh] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- عرض كامل الدقة في اللايتبوكس */}
            <img
              src={normalized[index]}
              alt={`${title} - ${index + 1}`}
              className="max-h-[85vh] max-w-full object-contain"
            />
            <p className="mt-3 text-center text-sm text-white/70">
              {index + 1} / {normalized.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
