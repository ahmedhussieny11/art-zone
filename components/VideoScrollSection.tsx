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

  /* Smoothly scroll past the entire pinned section. */
  const handleSkip = () => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const targetY = window.scrollY + rect.bottom + 4;
    window.scrollTo({ top: targetY, behavior: "smooth" });
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

        {/* Skip button — top-left of viewport (mirrored for RTL feel) */}
        {showSkip && (
          <button
            type="button"
            onClick={handleSkip}
            className="group absolute left-4 top-4 z-30 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-white/85 backdrop-blur-md transition-colors hover:bg-black/60 sm:left-6 sm:top-6"
            style={{ direction: "rtl" }}
            aria-label={skipText || "تخطي"}
          >
            <span>{skipText || "تخطي"}</span>
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 6l5 5 5-5" />
              <path d="M7 13l5 5 5-5" opacity="0.6" />
            </svg>
          </button>
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

        {/* Copy overlay */}
        {showOverlay && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end pb-16 text-center md:justify-center md:pb-0">
            {label && (
              <span
                className="mb-4 inline-block rounded-full px-5 py-2 text-xs font-semibold tracking-[0.2em] backdrop-blur-md"
                style={{
                  direction: "rtl",
                  color: accentColor,
                  backgroundColor: "rgba(0,0,0,0.40)",
                  border: `1px solid ${accentColor}66`,
                }}
              >
                {label}
              </span>
            )}
            {title && (
              <h2
                className="max-w-3xl px-6 font-serif text-3xl font-light leading-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl"
                style={{ direction: "rtl" }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className="mx-auto mt-5 max-w-xl px-6 text-sm leading-relaxed text-white/80 md:text-base"
                style={{ direction: "rtl" }}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Scroll hint */}
        {showOverlay && scrollHint && (
          <div
            className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[10px] tracking-[0.3em] text-white/40"
            style={{ direction: "rtl" }}
          >
            {scrollHint}
          </div>
        )}
      </div>
    </section>
  );
}
