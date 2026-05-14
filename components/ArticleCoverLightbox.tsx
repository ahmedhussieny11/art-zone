"use client";

import { useCallback, useEffect, useState } from "react";
import UploadedImage from "@/components/UploadedImage";
import { normalizeMediaPath } from "@/lib/media-url";
import { useSiteLocale } from "@/components/SiteProviders";

export default function ArticleCoverLightbox({ src, alt }: { src: string; alt: string }) {
  const { t } = useSiteLocale();
  const url = normalizeMediaPath(src);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative -mt-8 block aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-xl border-0 bg-transparent p-0 text-left shadow-2xl outline-none ring-gold/40 focus-visible:ring-2"
        aria-label={t("gallery.coverZoom")}
      >
        <UploadedImage src={url} alt={alt} fill className="object-contain bg-charcoal/5" sizes="100vw" priority />
        <span className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-[11px] text-white/90">
          {t("gallery.zoom")}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t("gallery.coverAlt")}
          onClick={close}
        >
          <button
            type="button"
            className="absolute left-4 top-4 z-[102] rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            onClick={close}
          >
            {t("gallery.close")}
          </button>
          <div className="max-h-[90vh] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={alt} className="max-h-[85vh] max-w-full object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
