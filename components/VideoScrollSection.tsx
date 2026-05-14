"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { VideoScrollConfig } from "@/lib/video-scroll-config";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Register GSAP plugin (browser only)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface VideoScrollSectionProps {
  config: VideoScrollConfig;
}

/* ── Minimal typing for the (still non-standard) frame callback API ── */
type RVFC = (
  cb: (now: number, metadata: VideoFrameCallbackMetadata) => void
) => number;
interface VideoFrameCallbackMetadata {
  presentationTime: number;
  expectedDisplayTime: number;
  width: number;
  height: number;
  mediaTime: number;
  presentedFrames: number;
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
  const [isReady, setIsReady] = useState(false);
  const [bufferedPct, setBufferedPct] = useState(0);

  /* ── Start scrubbing as soon as we have the first frame decoded.
     We don't wait for the whole video to buffer — with `+faststart` MP4
     and HTTP range requests, the browser can seek anywhere on demand. ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    setIsReady(false);
    setBufferedPct(0);

    const updateBuffered = () => {
      if (cancelled) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      let end = 0;
      for (let i = 0; i < video.buffered.length; i++) {
        end = Math.max(end, video.buffered.end(i));
      }
      setBufferedPct(Math.min(1, end / duration));
    };

    const markReady = () => {
      if (cancelled) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      /* readyState 2 = HAVE_CURRENT_DATA (first frame decoded). 
         That's enough to start scrubbing. */
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

    /* Kickstart buffering. Some browsers (Safari) require an explicit
       `play()` then `pause()` to actually start downloading. */
    video.load();
    const kickstart = video.play();
    if (kickstart && typeof kickstart.then === "function") {
      kickstart.then(() => video.pause()).catch(() => {
        /* Autoplay blocked — `preload="auto"` will still buffer. */
      });
    }

    /* Safety: if metadata is already there, fire ready check immediately */
    if (video.readyState >= 2) markReady();

    return () => {
      cancelled = true;
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, [videoSrc]);

  /* ── Bind video.currentTime to scroll progress ──
     We use a GSAP tween as a "scrub proxy" so ScrollTrigger applies its own
     smoothing (set via the `scrub` prop). Inside, we only write to
     `currentTime` if the requested time actually changed by ≥ 1 frame —
     this prevents redundant seeks that cause stutter. */
  useEffect(() => {
    if (!isReady) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const FRAME = 1 / 30;
    const proxy = { t: 0 };
    let lastSeek = -1;

    const writeFrame = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      const target = Math.max(0, Math.min(duration, proxy.t * duration));
      if (Math.abs(target - lastSeek) < FRAME * 0.5) return;
      lastSeek = target;
      try {
        video.currentTime = target;
      } catch {
        /* Safari can throw mid-seek — ignore */
      }
    };

    const tween = gsap.to(proxy, {
      t: 1,
      ease: "none",
      paused: true,
      onUpdate: writeFrame,
    });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub,
      invalidateOnRefresh: true,
      animation: tween,
    });

    const rvfc: RVFC | undefined = (
      video as HTMLVideoElement & { requestVideoFrameCallback?: RVFC }
    ).requestVideoFrameCallback?.bind(video);

    let rvfcHandle = 0;
    if (rvfc) {
      const tick = () => {
        rvfcHandle = rvfc(tick);
      };
      rvfcHandle = rvfc(tick);
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      trigger.kill();
      tween.kill();
      if (rvfcHandle) {
        const cancel = (
          video as HTMLVideoElement & {
            cancelVideoFrameCallback?: (h: number) => void;
          }
        ).cancelVideoFrameCallback;
        cancel?.call(video, rvfcHandle);
      }
    };
  }, [isReady, scrub, scrollMultiplier]);

  /* Jump past the pinned section — instant = أقصى استجابة */
  const handleSkip = () => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const targetY = window.scrollY + rect.bottom + 4;
    window.scrollTo({ top: targetY, behavior: "auto" });
  };

  if (!videoSrc) return null;

  const vignetteBg = `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(0,0,0,${vignetteOpacity}) 100%)`;

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
      {/* Sticky stage — pinned in viewport while the parent scrolls */}
      <div
        className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {/* Video — translateZ(0) promotes it to its own GPU layer */}
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
          className="h-full w-full object-cover will-change-transform"
        />

        {/* Soft gradient vignette for legibility */}
        {vignetteOpacity > 0 && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: vignetteBg }}
          />
        )}

        {/* Buffering overlay — disappears as soon as the first frame is decoded.
            After that, a tiny progress bar in the corner shows continued buffering. */}
        {!isReady && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: `${bgColor}E6` }}
          >
            <div className="h-1 w-48 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full transition-[width] duration-200 ease-out"
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

        {/* Tiny live buffer indicator while video continues to download */}
        {isReady && bufferedPct < 0.999 && (
          <div className="pointer-events-none absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-[9px] tracking-wider text-white/70 backdrop-blur-sm">
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {Math.round(bufferedPct * 100)}%
          </div>
        )}

        {/* Copy overlay — عمود واحد: الشارة → العنوان → الوصف → تلميح التمرير → زر التخطي */}
        {showOverlay && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-5 pb-10 pt-20 text-center sm:px-8 sm:pb-12">
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

              {scrollHint && (
                <div
                  className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-black/40 px-6 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:mt-7 sm:px-8 sm:py-4"
                  role="status"
                >
                  <svg
                    className="h-5 w-5 shrink-0 text-white/95 motion-safe:animate-bounce sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                  <span className="text-sm font-bold tracking-wide text-white sm:text-base">
                    {scrollHint}
                  </span>
                </div>
              )}

              {showSkip && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="pointer-events-auto mt-5 flex min-h-[48px] min-w-[140px] touch-manipulation items-center justify-center gap-2 rounded-full border-2 px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-lg transition-transform active:scale-[0.97] sm:mt-6 sm:min-h-[52px] sm:text-base"
                  style={{
                    borderColor: `${accentColor}CC`,
                    backgroundColor: "rgba(0,0,0,0.55)",
                    boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${accentColor}33 inset`,
                  }}
                  aria-label={skipText || "تخطي القسم والانتقال للأسفل"}
                >
                  <span>{skipText || "تخطي"}</span>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0 opacity-90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M12 5v14m0 0l-4-4m4 4l4-4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* زر التخطي لو النصوص مخفية — يظهر لوحده في المنتصف */}
        {!showOverlay && showSkip && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <button
              type="button"
              onClick={handleSkip}
              className="pointer-events-auto flex min-h-[48px] min-w-[140px] touch-manipulation items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-black/50 px-7 py-3 text-sm font-semibold text-white shadow-lg active:scale-[0.97]"
              style={{ direction: "rtl" }}
              aria-label={skipText || "تخطي"}
            >
              <span>{skipText || "تخطي"}</span>
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 5v14m0 0l-4-4m4 4l4-4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
