"use client";

import { useState } from "react";
import UploadedImage from "@/components/UploadedImage";
import FadeIn from "./ui/FadeIn";
import { useSiteLocale } from "@/components/SiteProviders";

interface Props {
  images: string[];
  clickAction: "lightbox" | "link";
  customLink: string;
}

export default function SocialGallery({ images, clickAction, customLink }: Props) {
  const { t } = useSiteLocale();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  function handleClick(i: number) {
    if (clickAction === "link" && customLink) {
      window.open(customLink, "_blank", "noopener,noreferrer");
    } else {
      setLightboxIndex(i);
    }
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function prev() {
    setLightboxIndex((c) => (c !== null ? (c - 1 + images.length) % images.length : null));
  }

  function next() {
    setLightboxIndex((c) => (c !== null ? (c + 1) % images.length : null));
  }

  return (
    <>
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-3 gap-3 md:grid-cols-6">
        {images.slice(0, 6).map((src, i) => (
          <FadeIn key={i} delay={i * 0.05}>
            <button
              type="button"
              onClick={() => handleClick(i)}
              className="group relative block aspect-square w-full overflow-hidden cursor-pointer"
            >
              <UploadedImage
                src={src}
                alt={t("socialGallery.imageAlt", { n: String(i + 1) })}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, 16vw"
              />
              <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/40" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {clickAction === "lightbox" ? (
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                )}
              </div>
            </button>
          </FadeIn>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}

          <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <UploadedImage
              src={images[lightboxIndex]}
              alt={t("socialGallery.imageAlt", { n: String(lightboxIndex + 1) })}
              width={1200}
              height={900}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
            />
            <div className="mt-3 text-center text-sm text-white/60">
              {lightboxIndex + 1} / {Math.min(images.length, 6)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
