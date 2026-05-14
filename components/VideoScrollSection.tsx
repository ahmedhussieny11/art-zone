"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { VideoScrollConfig } from "@/lib/video-scroll-config";

const HTML_SCRUB_CLASS = "video-scroll-scrub";
/** استعادة إعداد GSAP الافتراضي للـ ticker بعد مغادرة القسم */
const TICKER_LAG_DEFAULT = () => gsap.ticker.lagSmoothing(500, 33);

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface VideoScrollSectionProps {
  config: VideoScrollConfig;
}

function hintPlainText(hint: string): string {
  const t = hint.replace(/^\s*[↓⬇▼]\s*/u, "").trim();
  return t || hint.trim();
}

export default function VideoScrollSection({ config }: VideoScrollSectionProps) {
  const {
    videoSrc,
    posterSrc,
    label,
    title,
    description,
    scrollHint,
    scrollMultiplier,
    scrub,
    bgColor,
    accentColor,
    vignetteOpacity,
    showOverlay,
    showSkip,
    skipText,
  } = config;

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bufferBarRef = useRef<HTMLDivElement>(null);
  const bufferLabelRef = useRef<HTMLSpanElement>(null);
  const [isReady, setIsReady] = useState(false);
  /** نحدّث النسبة بدون React في الغالب — يمنع مئات الـ re-render أثناء التحميل/السكروب */
  const [bufferedPct, setBufferedPct] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    setIsReady(false);
    setBufferedPct(0);

    let lastUiPct = -1;
    let lastUiAt = 0;

    const paintBufferUi = (pct: number) => {
      const p = Math.min(1, Math.max(0, pct));
      const bar = bufferBarRef.current;
      const lab = bufferLabelRef.current;
      if (bar) bar.style.width = `${Math.max(8, Math.round(p * 100))}%`;
      if (lab) lab.textContent = `${Math.round(p * 100)}%`;
    };

    const updateBuffered = () => {
      if (cancelled) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      let end = 0;
      for (let i = 0; i < video.buffered.length; i++) {
        end = Math.max(end, video.buffered.end(i));
      }
      const pct = Math.min(1, end / duration);
      const now = performance.now();
      /* تحديث React فقط عند تغيّر ≥3% أو كل 350ms — يخفّف اللاج من الـ progress */
      if (
        Math.abs(pct - lastUiPct) >= 0.03 ||
        now - lastUiAt > 350 ||
        pct >= 0.999
      ) {
        lastUiPct = pct;
        lastUiAt = now;
        setBufferedPct(pct);
      } else {
        paintBufferUi(pct);
      }
    };

    const markReady = () => {
      if (cancelled) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      if (video.readyState >= 2) setIsReady(true);
    };

    const onProgress = () => updateBuffered();
    const onLoadedData = () => {
      updateBuffered();
      markReady();
    };
    const onLoadedMeta = () => {
      updateBuffered();
      markReady();
    };
    const onCanPlay = () => markReady();

    video.addEventListener("progress", onProgress);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("loadedmetadata", onLoadedMeta);
    video.addEventListener("canplay", onCanPlay);

    video.load();
    const kickstart = video.play();
    if (kickstart && typeof kickstart.then === "function") {
      kickstart.then(() => video.pause()).catch(() => {});
    }

    if (video.readyState >= 2) markReady();

    return () => {
      cancelled = true;
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [videoSrc]);

  useEffect(() => {
    if (!isReady) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const latest = { p: 0 };
    let rafId = 0;
    let lastApplied = -1;

    const setHtmlScrub = (on: boolean) => {
      document.documentElement.classList.toggle(HTML_SCRUB_CLASS, on);
    };

    /* أثناء السكروب على الفيديو: تعطيل lag smoothing في الـ ticker حتى لا يقفز الوقت ويثقل الشعور */
    const enableScrollSyncMode = () => {
      gsap.ticker.lagSmoothing(0, 16);
    };

    const flushSeek = () => {
      rafId = 0;
      const d = video.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      const next = Math.max(0, Math.min(d, latest.p * d));
      /* تجاهل seeks أقل من ~12ms عن آخر تطبيق — يقلّل ضغط الـ decoder بدون ما يبان تقطيع */
      if (lastApplied >= 0 && Math.abs(next - lastApplied) < 1 / 80) return;
      lastApplied = next;
      try {
        video.currentTime = next;
      } catch {
        /* Safari */
      }
    };

    const queueSeek = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(flushSeek);
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub,
      fastScrollEnd: 0.35,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        latest.p = self.progress;
        queueSeek();
      },
      onEnter: () => {
        setHtmlScrub(true);
        enableScrollSyncMode();
      },
      onLeave: () => {
        setHtmlScrub(false);
        TICKER_LAG_DEFAULT();
      },
      onEnterBack: () => {
        setHtmlScrub(true);
        enableScrollSyncMode();
      },
      onLeaveBack: () => {
        setHtmlScrub(false);
        TICKER_LAG_DEFAULT();
      },
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      if (rafId) cancelAnimationFrame(rafId);
      trigger.kill();
      setHtmlScrub(false);
      TICKER_LAG_DEFAULT();
    };
  }, [isReady, scrub, scrollMultiplier]);

  const handleSkip = () => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const targetY = window.scrollY + rect.bottom + 4;
    window.scrollTo({ top: targetY, behavior: "auto" });
  };

  if (!videoSrc) return null;

  const vignetteBg = `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(0,0,0,${vignetteOpacity}) 100%)`;
  const hintText = scrollHint ? hintPlainText(scrollHint) : "";

  return (
    <section
      ref={sectionRef}
      style={{
        height: `${Math.max(2, scrollMultiplier) * 100}vh`,
        backgroundColor: bgColor,
      }}
      className="relative w-full"
      aria-label={title}
    >
      <div
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
        style={{
          backgroundColor: bgColor,
          contain: "paint",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc || undefined}
          muted
          playsInline
          preload="auto"
          webkit-playsinline="true"
          disablePictureInPicture
          style={{
            transform: "translateZ(0)",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
          className="h-full w-full object-cover"
        />

        {vignetteOpacity > 0 && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: vignetteBg }}
          />
        )}

        {!isReady && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: `${bgColor}E6` }}
          >
            <div className="h-1 w-48 overflow-hidden rounded-full bg-white/15">
              <div
                ref={bufferBarRef}
                className="h-full"
                style={{
                  width: `${Math.max(8, Math.round(bufferedPct * 100))}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
            <span
              className="mt-3 text-[10px] tracking-[0.3em] text-white/50"
              style={{ direction: "rtl" }}
            >
              جارٍ تحضير الفيديو…
            </span>
          </div>
        )}

        {isReady && bufferedPct < 0.999 && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-[9px] tracking-wider text-white/70 backdrop-blur-sm">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full opacity-80"
              style={{ backgroundColor: accentColor }}
            />
            <span ref={bufferLabelRef}>{Math.round(bufferedPct * 100)}%</span>
          </div>
        )}

        {showOverlay && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-5 pb-28 pt-20 text-center sm:px-8 sm:pb-32">
            <div
              className="flex max-w-2xl flex-col items-center"
              style={{ direction: "rtl" }}
            >
              {label && (
                <span
                  className="mb-3 inline-block rounded-full px-5 py-2 text-xs font-semibold tracking-[0.2em] backdrop-blur-md sm:mb-4"
                  style={{
                    color: accentColor,
                    backgroundColor: "rgba(0,0,0,0.45)",
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
                  className="pointer-events-auto mt-6 touch-manipulation rounded-full border px-4 py-1.5 text-[11px] font-medium tracking-[0.22em] text-white/90 backdrop-blur-md transition-[border-color,background-color,transform] hover:bg-white/10 active:scale-[0.98] sm:mt-7 sm:px-5 sm:py-2 sm:text-xs"
                  style={{
                    borderColor: `${accentColor}55`,
                    backgroundColor: "rgba(0,0,0,0.28)",
                  }}
                  aria-label={skipText || "تخطي القسم"}
                >
                  {skipText || "تخطي"}
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
              className="pointer-events-auto touch-manipulation rounded-full border px-4 py-1.5 text-[11px] font-medium tracking-[0.22em] text-white/90 backdrop-blur-md transition-colors hover:bg-white/10 active:scale-[0.98] sm:px-5 sm:py-2 sm:text-xs"
              style={{
                direction: "rtl",
                borderColor: `${accentColor}55`,
                backgroundColor: "rgba(0,0,0,0.28)",
              }}
              aria-label={skipText || "تخطي"}
            >
              {skipText || "تخطي"}
            </button>
          </div>
        )}

        {hintText && (
          <p
            className="pointer-events-none absolute bottom-7 left-1/2 z-10 max-w-[92vw] -translate-x-1/2 text-center text-[10px] font-medium tracking-[0.32em] text-white/50 sm:bottom-10 sm:text-[11px]"
            style={{ direction: "rtl" }}
          >
            {hintText}
          </p>
        )}
      </div>
    </section>
  );
}
