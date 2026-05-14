"use client";

import UploadedImage from "@/components/UploadedImage";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import type { BrandSliderConfig, BrandSliderSlide } from "@/lib/data";
import { parallaxFactors, slideVariantsFor } from "@/lib/brand-slider-variants";
import { useSiteLocale } from "@/components/SiteProviders";

const easeLux = [0.33, 0, 0.2, 1] as const;

function frameStyle(config: BrandSliderConfig): CSSProperties {
  const vhMap: Record<BrandSliderConfig["sizePreset"], number> = {
    sm: 52,
    md: 65,
    lg: 78,
    xl: 88,
    full: 96,
  };
  const vh = vhMap[config.sizePreset] ?? 88;
  const [aw, ah] = config.aspectPreset.split("/").map((x) => parseInt(x, 10) || 1);
  return {
    aspectRatio: `${aw} / ${ah}`,
    width: `min(100vw, calc(${vh}vh * ${aw} / ${ah}))`,
    maxWidth: "100%",
  };
}

export default function BrandBannerSlider({ config }: { config: BrandSliderConfig }) {
  const { t } = useSiteLocale();
  const slides = config.slides;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  const go = useCallback(
    (next: number, direction: number) => {
      setDir(direction);
      setIndex((next + slides.length) % slides.length);
      setProgress(0);
    },
    [slides.length]
  );

  const autoMs = config.autoMs;

  useEffect(() => {
    if (reduceMotion || slides.length <= 1) return;
    setProgress(0);
    const stepMs = 48;
    const iv = setInterval(() => {
      setProgress((p) => Math.min(1, p + stepMs / autoMs));
    }, stepMs);
    const t = setTimeout(() => go(index + 1, 1), autoMs);
    return () => {
      clearInterval(iv);
      clearTimeout(t);
    };
  }, [index, go, reduceMotion, slides.length, autoMs]);

  const next = () => go(index + 1, 1);
  const prev = () => go(index - 1, -1);

  if (slides.length === 0) return null;

  const slide = slides[index];
  const use3dPerspective = config.animation === "soft3d" && !reduceMotion;

  return (
    <section
      className="relative w-full overflow-x-clip overflow-y-visible bg-[#1a1918] py-10 md:py-14"
      aria-label={config.sectionTitle || t("brandSlider.defaultAria")}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-100"
        aria-hidden
        animate={
          reduceMotion
            ? {}
            : {
                background: [
                  "radial-gradient(ellipse 120% 80% at 20% 0%, rgba(201,169,110,0.12), transparent 50%)",
                  "radial-gradient(ellipse 120% 80% at 80% 20%, rgba(201,169,110,0.1), transparent 55%)",
                  "radial-gradient(ellipse 120% 80% at 20% 0%, rgba(201,169,110,0.12), transparent 50%)",
                ],
              }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(0,0,0,0.38),transparent_55%)]" />

      <div className="relative z-10 w-full">
        {config.showSectionHeader && (config.sectionEyebrow || config.sectionTitle) && (
          <motion.div
            className="mb-6 px-6 text-center md:mb-8"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: easeLux }}
          >
            {config.sectionEyebrow && (
              <span className="text-[11px] font-medium uppercase tracking-[0.38em] text-gold/85">
                {config.sectionEyebrow}
              </span>
            )}
            {config.sectionTitle && (
              <h2 className="mt-3 font-serif text-2xl font-light text-white md:text-3xl">{config.sectionTitle}</h2>
            )}
          </motion.div>
        )}

        <div
          className="relative w-full"
          style={{ perspective: use3dPerspective ? "2000px" : undefined }}
        >
          <div className="relative mx-auto w-full max-w-[100vw] px-0">
            <div
              className="relative mx-auto overflow-hidden border border-white/[0.06] shadow-[0_40px_100px_-24px_rgba(0,0,0,0.75)]"
              style={frameStyle(config)}
            >
              <motion.div
                className="pointer-events-none absolute -bottom-8 left-[5%] right-[5%] h-20 rounded-[100%] md:-bottom-10 md:h-24"
                aria-hidden
                animate={reduceMotion ? {} : { opacity: [0.2, 0.4, 0.2], scaleX: [0.92, 1, 0.92] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background: "radial-gradient(ellipse at center, rgba(201,169,110,0.26), transparent 72%)",
                  filter: "blur(24px)",
                }}
              />

              <FrameCorners />

              <AnimatePresence initial={false} custom={dir} mode="wait">
                <SlidePanel
                  key={slide.id}
                  slide={slide}
                  custom={dir}
                  reduceMotion={!!reduceMotion}
                  animation={config.animation}
                  parallax={config.parallax}
                  showTextOverlay={config.showTextOverlay}
                  showShimmer={config.animation !== "fade"}
                  isFirst={index === 0}
                />
              </AnimatePresence>

              <button
                type="button"
                onClick={prev}
                className="group absolute start-1 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-charcoal/55 text-white/90 shadow-lg backdrop-blur-md transition-all duration-500 hover:border-gold/35 hover:bg-charcoal/80 hover:text-gold-light sm:start-2 md:start-4 lg:start-6"
                aria-label={t("brandSlider.prev")}
              >
                <motion.span className="flex" whileHover={{ x: -2 }} whileTap={{ scale: 0.94 }}>
                  <Chevron direction="prev" />
                </motion.span>
              </button>
              <button
                type="button"
                onClick={next}
                className="group absolute end-1 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.08] bg-charcoal/55 text-white/90 shadow-lg backdrop-blur-md transition-all duration-500 hover:border-gold/35 hover:bg-charcoal/80 hover:text-gold-light sm:end-2 md:end-4 lg:end-6"
                aria-label={t("brandSlider.next")}
              >
                <motion.span className="flex" whileHover={{ x: 2 }} whileTap={{ scale: 0.94 }}>
                  <Chevron direction="next" />
                </motion.span>
              </button>
            </div>
          </div>

          {slides.length > 1 && (
            <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-4 px-6">
              <div className="flex h-1 w-full max-w-md overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-l from-gold-dark via-gold to-gold-light"
                  initial={false}
                  animate={{ width: `${((index + progress) / slides.length) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 26 }}
                />
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => go(i, i > index ? 1 : -1)}
                    className="group relative flex flex-col items-center gap-1.5"
                    aria-label={t("brandSlider.goToSlide", { n: String(i + 1) })}
                    aria-current={i === index}
                  >
                    <span
                      className={`h-2 rounded-full transition-all duration-500 ${
                        i === index ? "w-10 bg-gold" : "w-2 bg-white/15 group-hover:bg-white/30"
                      }`}
                    />
                    <span
                      className={`text-[10px] uppercase tracking-widest transition-colors ${
                        i === index ? "text-gold/90" : "text-white/25"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {config.showCta && (
            <motion.div
              className="mt-12 flex flex-wrap justify-center gap-4 px-6 pb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <Link
                href={config.cta1Href || "/portfolio"}
                className="rounded-sm border border-gold/40 bg-gold/95 px-8 py-3 text-sm font-medium tracking-wide text-white shadow-[0_12px_40px_-12px_rgba(201,169,110,0.45)] transition-all duration-300 hover:border-gold hover:bg-gold-dark hover:shadow-[0_16px_48px_-12px_rgba(201,169,110,0.5)]"
              >
                {config.cta1Text}
              </Link>
              <Link
                href={config.cta2Href || "/contact"}
                className="rounded-sm border border-white/15 bg-transparent px-8 py-3 text-sm font-medium tracking-wide text-white/90 transition-all duration-300 hover:border-gold/40 hover:bg-white/[0.04]"
              >
                {config.cta2Text}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

function SlidePanel({
  slide,
  custom,
  reduceMotion,
  animation,
  parallax,
  showTextOverlay,
  showShimmer,
  isFirst,
}: {
  slide: BrandSliderSlide;
  custom: number;
  reduceMotion: boolean;
  animation: BrandSliderConfig["animation"];
  parallax: BrandSliderConfig["parallax"];
  showTextOverlay: boolean;
  showShimmer: boolean;
  isFirst: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 64, damping: 22, mass: 0.55 });
  const sy = useSpring(my, { stiffness: 64, damping: 22, mass: 0.55 });
  const rotateX = useMotionTemplate`${sy}deg`;
  const rotateY = useMotionTemplate`${sx}deg`;
  const { rx, ry } = parallaxFactors(parallax);

  const onMove = (e: React.PointerEvent) => {
    if (reduceMotion || rx === 0 || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px * -rx * 2);
    my.set(py * ry * 2);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const { variants, transition } = slideVariantsFor(animation, reduceMotion);
  const tiltStyle =
    reduceMotion || rx === 0 ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" as const };

  return (
    <motion.div
      custom={custom}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      style={{ transformStyle: animation === "soft3d" && !reduceMotion ? "preserve-3d" : undefined }}
      className="absolute inset-0"
    >
      <div
        ref={wrapRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="h-full w-full cursor-default"
        style={{ perspective: animation === "soft3d" && !reduceMotion ? "1600px" : undefined }}
      >
        <motion.div className="relative h-full w-full" style={tiltStyle}>
          <div
            className="absolute -inset-px rounded-[1px] bg-gradient-to-br from-gold/30 via-gold/8 to-transparent opacity-90"
            style={{ transform: "translateZ(-2px)" }}
            aria-hidden
          />

          <div
            className="relative h-full w-full bg-[#141312]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <UploadedImage
              src={slide.src}
              alt={slide.title}
              fill
              priority={isFirst}
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, min(100vw, 92vh)"
            />

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141312]/88 via-[#141312]/12 to-transparent"
              style={{ transform: "translateZ(1px)" }}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/[0.03] via-transparent to-transparent"
              style={{ transform: "translateZ(2px)" }}
            />

            {showShimmer && !reduceMotion && (
              <motion.div
                className="pointer-events-none absolute inset-0 z-[3] opacity-[0.07]"
                style={{
                  background:
                    "linear-gradient(100deg, transparent 42%, rgba(255,248,235,0.25) 50%, transparent 58%)",
                  transform: "translateZ(3px)",
                }}
                animate={{ x: ["-20%", "120%"] }}
                transition={{ duration: 7, repeat: Infinity, repeatDelay: 6, ease: [0.4, 0, 0.2, 1] }}
              />
            )}

            {showTextOverlay && (
              <div
                className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 pt-12 text-center sm:px-8 md:px-12 md:pb-8"
                style={{ transform: "translateZ(20px)" }}
              >
                <motion.h3
                  key={slide.title}
                  initial={{ opacity: 0, y: 16, filter: reduceMotion ? "none" : "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.06, duration: 0.65, ease: easeLux }}
                  className="font-serif text-xl font-light tracking-[0.02em] text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.55)] sm:text-2xl md:text-3xl"
                >
                  {slide.title}
                </motion.h3>
                <motion.p
                  key={slide.subtitle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: easeLux }}
                  className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-white/70 sm:text-sm md:text-[15px]"
                >
                  {slide.subtitle}
                </motion.p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FrameCorners() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[15] md:-inset-3" aria-hidden>
      <svg className="h-full w-full text-gold/40" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d="M 2 18 L 2 2 L 18 2"
          stroke="currentColor"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: easeLux }}
        />
        <motion.path
          d="M 82 2 L 98 2 L 98 18"
          stroke="currentColor"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.12, ease: easeLux }}
        />
        <motion.path
          d="M 2 82 L 2 98 L 18 98"
          stroke="currentColor"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.24, ease: easeLux }}
        />
        <motion.path
          d="M 98 82 L 98 98 L 82 98"
          stroke="currentColor"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.36, ease: easeLux }}
        />
      </svg>
    </div>
  );
}

function Chevron({ direction }: { direction: "prev" | "next" }) {
  const d = direction === "next";
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={d ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );
}
