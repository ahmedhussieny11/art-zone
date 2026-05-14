"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
  MotionValue,
} from "framer-motion";
import UploadedImage from "@/components/UploadedImage";
import Link from "next/link";
import type { ZoomPortalConfig, ZoomPortalLayer, ZoomPortalHotspot } from "@/lib/zoom-portal-data";
import { useSiteLocale } from "@/components/SiteProviders";

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Spring config
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SPRING = { stiffness: 65, damping: 22, mass: 0.8 };

/* ── Compute scroll timing for a single layer ── */
function layerTiming(index: number, total: number) {
  if (total === 1) {
    return {
      scaleInput:   [0, 1] as number[],
      scaleOutput:  [1, 1] as number[],
      opacityInput: [0, 1] as number[],
      opacityOutput:[1, 1] as number[],
    };
  }
  const seg = 1 / (total - 1);
  const isFirst = index === 0;
  const isLast  = index === total - 1;

  if (isFirst) {
    const fadeEnd  = Math.min(seg * 0.75, 0.9);
    const zoomEnd  = Math.min(seg * 1.0,  0.95);
    return {
      scaleInput:   [0, zoomEnd],
      scaleOutput:  [1, 20],   // always full zoom out (maxZoom applied in component)
      opacityInput: [0, fadeEnd],
      opacityOutput:[1, 0],
    };
  }

  if (isLast) {
    const start = Math.max((index - 1) * seg + seg * 0.35, 0);
    const mid   = Math.min(start + seg * 0.3, 1);
    return {
      scaleInput:   [start, 1],
      scaleOutput:  [0, 1],    // entry scale applied as factor in component
      opacityInput: [start, mid],
      opacityOutput:[0, 1],
    };
  }

  // Middle layers
  const entryStart = Math.max((index - 1) * seg + seg * 0.35, 0);
  const entryFull  = Math.min(entryStart + seg * 0.18, 1);
  const exitStart  = Math.min(index * seg + seg * 0.1, 1);
  const exitEnd    = Math.min(index * seg + seg * 0.8, 1);
  return {
    scaleInput:   [entryStart, exitEnd],
    scaleOutput:  [0, 20],
    opacityInput: [entryStart, entryFull, exitStart, exitEnd],
    opacityOutput:[0, 1, 1, 0],
  };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Single layer — own hooks, valid React component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function LayerView({
  layer,
  index,
  total,
  scrollYProgress,
  imgVigBg,
}: {
  layer: ZoomPortalLayer;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  imgVigBg: string;
}) {
  const t = layerTiming(index, total);
  const isLast  = index === total - 1;
  const isFirst = index === 0;

  const rawScale = useTransform(scrollYProgress, t.scaleInput, t.scaleOutput);
  const rawOpacity = useTransform(scrollYProgress, t.opacityInput, t.opacityOutput);

  const springScale   = useSpring(rawScale,   SPRING);
  const springOpacity = useSpring(rawOpacity, SPRING);

  /* Remap scale: for first layer map 1→maxZoom, for last 0→entryScale,
     for middle 0→(entryScale) on left end, 20→maxZoom on right end */
  const scaleMapped = useTransform(springScale, (v) => {
    if (isFirst) return 1 + (v - 1) * ((layer.maxZoom - 1) / 19);
    if (isLast)  return layer.entryScale + v * (1 - layer.entryScale);
    // middle: 0-20 range → entryScale to maxZoom
    return layer.entryScale + (v / 20) * (layer.maxZoom - layer.entryScale);
  });

  return (
    <motion.div
      style={{
        scale:           scaleMapped,
        opacity:         springOpacity,
        transformOrigin: `${layer.zoomOriginX}% ${layer.zoomOriginY}%`,
      }}
      className="absolute inset-0 will-change-transform"
    >
      {layer.src && (
        <UploadedImage src={layer.src} alt={layer.label} fill priority={isFirst} sizes="100vw" className="object-cover" />
      )}
      <div className="absolute inset-0" style={{ background: imgVigBg }} />
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Hotspot tag
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HotspotTag({
  h,
  progress,
  accent,
}: {
  h: ZoomPortalHotspot;
  progress: number;
  accent: string;
}) {
  const visible  = progress >= h.scrollStart && progress <= h.scrollEnd;
  const goesLeft = h.x > 52;

  const card = (
    <div
      style={{
        background:          "rgba(0,0,0,0.62)",
        border:              `1px solid ${accent}40`,
        backdropFilter:      "blur(12px)",
        WebkitBackdropFilter:"blur(12px)",
      }}
      className={`rounded-xl px-3 py-2 text-left ${goesLeft ? "mr-2" : "ml-2"}`}
    >
      <p style={{ color: `${accent}DD` }} className="text-[9px] font-semibold uppercase tracking-[0.18em]">
        {h.title}
      </p>
      <p className="mt-0.5 text-[11px] font-medium leading-snug text-white/90">{h.value}</p>
      {h.note && <p className="mt-0.5 text-[9px] leading-snug text-white/40">{h.note}</p>}
    </div>
  );

  const line = (
    <div style={{ height: "1px", width: "40px", flexShrink: 0,
      background: `linear-gradient(to right, ${accent}BB, ${accent}40)` }} />
  );

  const dot = (
    <div className="relative flex-shrink-0">
      <div style={{ background: accent, border: `1px solid ${accent}99` }} className="h-2.5 w-2.5 rounded-full" />
      {visible && (
        <motion.div
          style={{ background: `${accent}60` }}
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 2.4, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );

  return (
    <motion.div
      className="absolute flex items-center"
      style={{ left: `${h.x}%`, top: `${h.y}%`, translateY: "-50%",
        translateX: goesLeft ? "-100%" : "0%", direction: "ltr" }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : goesLeft ? 12 : -12 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {goesLeft && card}{goesLeft && line}
      {dot}
      {!goesLeft && line}{!goesLeft && card}
    </motion.div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Progress dot — own component so it can use hooks
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ProgressDot({
  index,
  total,
  scrollYProgress,
  color,
}: {
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  color: string;
}) {
  const seg = total <= 1 ? 1 : 1 / (total - 1);
  const start = Math.max(index * seg - seg * 0.15, 0);
  const end   = Math.min(start + seg, 1);
  const raw   = useTransform(scrollYProgress, [start, start + seg * 0.1, end - seg * 0.1, end], [0.25, 1, 1, 0.25]);
  const opacity = useSpring(raw, SPRING);
  return (
    <motion.span style={{ opacity, backgroundColor: color }}
      className="block h-1 w-6 rounded-full" />
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Main component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function ZoomPortal({ config }: { config: ZoomPortalConfig }) {
  const { t } = useSiteLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress]   = useState(0);
  const [hoverCta1, setHoverCta1] = useState(false);
  const [hoverCta2, setHoverCta2] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", setProgress);

  const n      = config.layers;
  const accent = config.accentColor;

  /* Text overlays */
  const textOpacity = useSpring(useTransform(scrollYProgress, [0.75, 0.90], [0, 1]), SPRING);
  const textY       = useSpring(useTransform(scrollYProgress, [0.75, 0.90], [40, 0]), SPRING);
  const topOpacity  = useSpring(useTransform(scrollYProgress, [0, 0.12],    [1, 0]), SPRING);

  const vigBg    = `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(0,0,0,${config.vignetteOpacity}) 100%)`;
  const imgVigBg = `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.5) 100%)`;

  const allHotspots = n.flatMap((l) => l.hotspots ?? []);
  const lastLayer   = n[n.length - 1];

  return (
    <section
      ref={containerRef}
      style={{ height: config.scrollHeight }}
      className="relative"
      aria-label={t("zoom.aria")}
    >
      <div className="sticky top-0 h-screen overflow-hidden" style={{ backgroundColor: config.bgColor }}>

        {/* Images — rendered in reverse so first layer is on top */}
        <div className="absolute inset-0">
          {[...n].reverse().map((layer, ri) => {
            const i = n.length - 1 - ri;
            return (
              <LayerView
                key={layer.id}
                layer={layer}
                index={i}
                total={n.length}
                scrollYProgress={scrollYProgress}
                imgVigBg={imgVigBg}
              />
            );
          })}
        </div>

        {/* Global vignette */}
        <div className="pointer-events-none absolute inset-0 z-10" style={{ background: vigBg }} />

        {/* Grain */}
        <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" style={{ opacity: config.grainOpacity }}>
          <filter id="zp-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#zp-grain)" />
        </svg>

        {/* Hotspots */}
        <div className="pointer-events-none absolute inset-0 z-[15]">
          {allHotspots.map((h, i) => (
            <HotspotTag key={h.id ?? i} h={h} progress={progress} accent={accent} />
          ))}
        </div>

        {/* Top badge */}
        <motion.div style={{ opacity: topOpacity }}
          className="absolute inset-x-0 top-0 z-20 flex flex-col items-center pt-16 text-center">
          <span style={{ color: accent, background: `${accent}14`, border: `1px solid ${accent}40`,
            backdropFilter: "blur(8px)" }}
            className="inline-block rounded-full px-5 py-2 text-xs font-semibold tracking-[0.2em]">
            {config.topBadge}
          </span>
          <p style={{ color: "rgba(255,255,255,0.30)" }} className="mt-4 text-[11px] tracking-[0.25em]">
            ↓ &nbsp; {config.topHint}
          </p>
        </motion.div>

        {/* Final CTA */}
        <motion.div style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
          <span style={{ color: accent, background: "rgba(0,0,0,0.40)", border: `1px solid ${accent}4D`,
            backdropFilter: "blur(8px)" }}
            className="mb-4 inline-block rounded-full px-5 py-2 text-xs font-semibold tracking-[0.2em]">
            {lastLayer?.label ?? ""}
          </span>
          <h2 style={{ color: config.finalTitleColor }}
            className="font-serif text-4xl font-light leading-tight drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
            {config.finalTitle}
          </h2>
          <p style={{ color: config.finalSubColor }}
            className="mx-auto mt-5 max-w-md text-sm leading-relaxed drop-shadow-lg md:text-base">
            {config.finalSub}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <Link href={config.cta1Link}
              style={{ background: hoverCta1 ? `${config.cta1Bg}CC` : config.cta1Bg, color: config.cta1Color,
                transition: "background 0.2s" }}
              className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-sm font-medium tracking-widest shadow-lg"
              onMouseEnter={() => setHoverCta1(true)} onMouseLeave={() => setHoverCta1(false)}>
              {config.cta1Text}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            </Link>
            <Link href={config.cta2Link}
              style={{ color: hoverCta2 ? accent : config.cta2Color,
                border: `1px solid ${hoverCta2 ? `${accent}80` : "rgba(255,255,255,0.20)"}`,
                backdropFilter: "blur(8px)", transition: "color 0.2s, border-color 0.2s" }}
              className="inline-flex items-center rounded-2xl px-8 py-4 text-sm font-medium tracking-widest"
              onMouseEnter={() => setHoverCta2(true)} onMouseLeave={() => setHoverCta2(false)}>
              {config.cta2Text}
            </Link>
          </div>
        </motion.div>

        {/* Progress dots */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {n.map((_, i) => (
            <ProgressDot key={i} index={i} total={n.length} scrollYProgress={scrollYProgress} color={accent} />
          ))}
        </div>
      </div>
    </section>
  );
}
