"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { VideoScrollConfig } from "@/lib/video-scroll-config";
import {
  buildFrameUrls,
  drawImageCover,
  nearestLoadedFrame,
  progressToFrameIndex,
  startStagedPreload,
} from "@/lib/scroll-frame-sequence";
import { useSiteLocale } from "@/components/SiteProviders";

const HTML_SCRUB_CLASS = "video-scroll-scrub";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CanvasScrollSectionProps {
  config: VideoScrollConfig;
}

function hintPlainText(hint: string): string {
  const t = hint.replace(/^\s*[↓⬇▼]\s*/u, "").trim();
  return t || hint.trim();
}

export default function CanvasScrollSection({ config }: CanvasScrollSectionProps) {
  const { t, locale } = useSiteLocale();
  const {
    framesPath,
    frameCount,
    frameExtension,
    scrollMultiplier,
    scrub,
    bgColor,
    accentColor,
    vignetteOpacity,
    label,
    title,
    description,
    scrollHint,
    showOverlay,
    showSkip,
    skipText,
  } = config;

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const frameIdxRef = useRef(-1);
  const [loadPct, setLoadPct] = useState(0);
  const [isPlayable, setIsPlayable] = useState(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const frameUrls = buildFrameUrls(
    framesPath,
    frameCount,
    1,
    frameExtension || "jpg",
  );

  useEffect(() => {
    setIsPlayable(false);
    setIsFullyLoaded(false);
    setLoadError(null);
    setLoadPct(0);
    imagesRef.current = [];
    frameIdxRef.current = -1;

    const cancel = startStagedPreload(frameUrls, {
      onProgress: ({ loaded, total }) => {
        setLoadPct(Math.round((loaded / total) * 100));
      },
      onPlayable: (images) => {
        imagesRef.current = images;
        setIsPlayable(true);
      },
      onComplete: (images) => {
        imagesRef.current = images;
        setIsFullyLoaded(true);
        setLoadPct(100);
      },
      onError: (err) => setLoadError(err.message),
    });

    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URLs derived from path + count
  }, [framesPath, frameCount, frameExtension]);

  useEffect(() => {
    if (!isPlayable) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const images = imagesRef.current;
    if (!section || !canvas || images.length === 0) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const setHtmlScrub = (on: boolean) => {
      document.documentElement.classList.toggle(HTML_SCRUB_CLASS, on);
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 1 || h < 1) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const paintFrame = (index: number) => {
      if (index === frameIdxRef.current) return;
      const img = nearestLoadedFrame(images, index);
      if (!img) return;
      frameIdxRef.current = index;
      drawImageCover(ctx, img, canvas.clientWidth, canvas.clientHeight);
    };

    resizeCanvas();
    paintFrame(0);

    const scrollScrub =
      typeof scrub === "number" && scrub > 0 ? scrub : 1;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: scrollScrub,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        paintFrame(progressToFrameIndex(self.progress, images.length));
      },
      onRefresh: (self) => {
        frameIdxRef.current = -1;
        resizeCanvas();
        paintFrame(progressToFrameIndex(self.progress, images.length));
      },
      onEnter: () => setHtmlScrub(true),
      onLeave: () => setHtmlScrub(false),
      onEnterBack: () => setHtmlScrub(true),
      onLeaveBack: () => setHtmlScrub(false),
    });

    frameIdxRef.current = -1;
    paintFrame(progressToFrameIndex(trigger.progress, images.length));

    const onResize = () => {
      frameIdxRef.current = -1;
      resizeCanvas();
      paintFrame(progressToFrameIndex(trigger.progress, images.length));
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      trigger.kill();
      setHtmlScrub(false);
    };
  }, [isPlayable, scrollMultiplier, scrub, frameCount, framesPath]);

  const handleSkip = () => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    window.scrollTo({
      top: window.scrollY + rect.bottom + 4,
      behavior: "auto",
    });
  };

  const vignetteBg = `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(0,0,0,${vignetteOpacity}) 100%)`;
  const hintText = scrollHint ? hintPlainText(scrollHint) : "";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <section
      ref={sectionRef}
      style={{
        height: `${Math.max(2, scrollMultiplier) * 100}vh`,
        backgroundColor: bgColor,
        overscrollBehavior: "contain",
      }}
      className="relative w-full"
      aria-label={title || "scroll animation"}
    >
      <StickyStage bgColor={bgColor}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          aria-hidden
        />

        {vignetteOpacity > 0 && (
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ background: vignetteBg }}
          />
        )}

        {!isPlayable && !loadError && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
            style={{ backgroundColor: `${bgColor}F0` }}
          >
            <LoadingSpinner accentColor={accentColor} />
            <LoadingBar pct={loadPct} accentColor={accentColor} />
            <span
              className="text-[10px] tracking-[0.3em] text-white/50"
              style={{ direction: dir }}
            >
              {loadPct}% — {t("videoScroll.preparing")}
            </span>
          </div>
        )}

        {isPlayable && !isFullyLoaded && !loadError && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-[9px] tracking-wider text-white/70">
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full opacity-80"
              style={{ backgroundColor: accentColor }}
            />
            <span>{loadPct}%</span>
          </div>
        )}

        {loadError && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center text-sm text-white/80"
            style={{ backgroundColor: `${bgColor}F0`, direction: dir }}
          >
            <p>
              {loadError}
              <br />
              <span className="mt-2 block text-xs text-white/50">
                ضع الملفات في <code className="text-white/70">{framesPath}</code>
                {" "}
                (frame_0001.{frameExtension || "jpg"} … frame_
                {String(frameCount).padStart(4, "0")}.{frameExtension || "jpg"})
              </span>
            </p>
          </div>
        )}

        {showOverlay && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-5 pb-28 pt-20 text-center sm:px-8 sm:pb-32">
            <div
              className="flex max-w-2xl flex-col items-center"
              style={{ direction: dir }}
            >
              {label && (
                <span
                  className="mb-3 inline-block rounded-full px-5 py-2 text-xs font-semibold tracking-[0.2em] sm:mb-4"
                  style={{
                    color: accentColor,
                    backgroundColor: "rgba(0,0,0,0.62)",
                    border: `1px solid ${accentColor}66`,
                  }}
                >
                  {label}
                </span>
              )}
              {title && (
                <h2 className="max-w-3xl font-serif text-2xl font-light leading-snug text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)] sm:text-4xl md:text-5xl">
                  {title}
                </h2>
              )}
              {description && (
                <p
                  className={`mx-auto max-w-xl text-base font-medium leading-relaxed text-white/95 drop-shadow-[0_1px_12px_rgba(0,0,0,0.8)] sm:text-lg ${
                    title ? "mt-4" : "mt-1"
                  }`}
                >
                  {description}
                </p>
              )}
              {showSkip && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="pointer-events-auto mt-6 touch-manipulation rounded-full border px-4 py-1.5 text-[11px] font-medium tracking-[0.22em] text-white/90 transition-[border-color,background-color,transform] hover:bg-white/10 active:scale-[0.98] sm:mt-7 sm:px-5 sm:py-2 sm:text-xs"
                  style={{
                    borderColor: `${accentColor}55`,
                    backgroundColor: "rgba(0,0,0,0.55)",
                  }}
                  aria-label={skipText || t("videoScroll.skipSection")}
                >
                  {skipText || t("videoScroll.skip")}
                </button>
              )}
            </div>
          </div>
        )}

        {!showOverlay && showSkip && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <button
              type="button"
              onClick={handleSkip}
              className="pointer-events-auto touch-manipulation rounded-full border px-4 py-1.5 text-[11px] font-medium tracking-[0.22em] text-white/90 transition-colors hover:bg-white/10 active:scale-[0.98] sm:px-5 sm:py-2 sm:text-xs"
              style={{
                direction: dir,
                borderColor: `${accentColor}55`,
                backgroundColor: "rgba(0,0,0,0.55)",
              }}
              aria-label={skipText || t("videoScroll.skipSection")}
            >
              {skipText || t("videoScroll.skip")}
            </button>
          </div>
        )}

        {hintText && (
          <p
            className="pointer-events-none absolute bottom-7 left-1/2 z-10 max-w-[92vw] -translate-x-1/2 text-center text-[10px] font-medium tracking-[0.32em] text-white/50 sm:bottom-10 sm:text-[11px]"
            style={{ direction: dir }}
          >
            {hintText}
          </p>
        )}
      </StickyStage>
    </section>
  );
}

function StickyStage({
  bgColor,
  children,
}: {
  bgColor: string;
  children: ReactNode;
}) {
  return (
    <div
      className="sticky top-0 h-screen w-full overflow-hidden"
      style={{ backgroundColor: bgColor, contain: "paint" }}
    >
      {children}
    </div>
  );
}

function LoadingSpinner({ accentColor }: { accentColor: string }) {
  return (
    <div
      className="h-10 w-10 animate-spin rounded-full border-2"
      style={{
        borderColor: `${accentColor}33`,
        borderTopColor: accentColor,
      }}
      role="status"
      aria-label="loading"
    />
  );
}

function LoadingBar({
  pct,
  accentColor,
}: {
  pct: number;
  accentColor: string;
}) {
  return (
    <div className="h-1 w-48 overflow-hidden rounded-full bg-white/15">
      <div
        className="h-full transition-[width] duration-150"
        style={{
          width: `${Math.max(4, pct)}%`,
          backgroundColor: accentColor,
        }}
      />
    </div>
  );
}
