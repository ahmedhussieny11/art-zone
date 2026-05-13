"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface HeroSectionProps {
  label?: string;
  title?: string;
  subtitle?: string;
  cta1Text?: string;
  cta1Link?: string;
  cta2Text?: string;
  cta2Link?: string;
  keywordsEnabled?: boolean;
  keywords?: string[];
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className="font-serif text-4xl font-light text-white md:text-5xl">
      {isInView ? (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {value}{suffix}
        </motion.span>
      ) : (
        <span className="opacity-0">0</span>
      )}
    </span>
  );
}

const stats = [
  { value: 150, suffix: "+", label: "مشروع مكتمل" },
  { value: 12, suffix: "+", label: "سنوات خبرة" },
  { value: 98, suffix: "%", label: "رضا العملاء" },
];

const DEFAULT_KEYWORDS = ["تصميم داخلي", "فاخر", "إبداعي", "عصري", "أنيق", "مميّز", "احترافي", "راقي"];

export default function HeroSection({
  label = "استوديو تصميم داخلي فاخر",
  title = "نصنع مساحات تُلهم الإبداع",
  subtitle = "من الفكرة إلى التنفيذ، نحوّل المساحات العادية إلى تجارب استثنائية. كل تفصيلة مصممة بدقة وشغف وهدف.",
  cta1Text = "شاهد أعمالنا",
  cta1Link = "/portfolio",
  cta2Text = "احجز استشارة",
  cta2Link = "/contact",
  keywordsEnabled = true,
  keywords = DEFAULT_KEYWORDS,
}: HeroSectionProps) {
  const activeWords = keywords.length > 0 ? keywords : DEFAULT_KEYWORDS;

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-charcoal">
      {/* Grain texture overlay */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]">
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Radial gold glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,_rgba(201,169,110,0.08),_transparent_60%)]" />

      {/* Decorative grid lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(201,169,110,1)_1px,transparent_1px),linear-gradient(0deg,rgba(201,169,110,1)_1px,transparent_1px)] bg-[size:120px_120px]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-0 pt-32">
        <div className="mx-auto w-full max-w-5xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-6 inline-block rounded-full border border-gold/20 bg-gold/5 px-5 py-2 text-xs font-semibold tracking-[0.2em] text-gold"
          >
            {label}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto max-w-4xl font-serif text-5xl font-light leading-[1.1] text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/40 md:text-lg"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href={cta1Link}
              className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gold px-8 py-4 text-sm font-medium tracking-widest text-white shadow-lg shadow-gold/20 transition-all hover:bg-gold-dark hover:shadow-xl hover:shadow-gold/30"
            >
              {cta1Text}
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
            </Link>
            <Link
              href={cta2Link}
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-8 py-4 text-sm font-medium tracking-widest text-white/70 transition-all hover:border-gold/50 hover:text-gold"
            >
              {cta2Text}
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="mx-auto mt-16 flex max-w-lg items-center justify-center"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center">
                <div className="px-6 text-center md:px-8">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  <p className="mt-1 text-[11px] font-medium tracking-widest text-white/30">
                    {stat.label}
                  </p>
                </div>
                {i < stats.length - 1 && (
                  <div className="h-10 w-px bg-white/10" />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — above marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="relative z-10 mb-6 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] text-white/25">انزل للأسفل</span>
          <div className="h-8 w-px bg-gradient-to-b from-white/25 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Keywords band — bottom edge */}
      {keywordsEnabled && activeWords.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="relative z-10 border-t border-b border-white/5 bg-gold/5 py-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 px-6">
            {activeWords.map((word, i) => (
              <span key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium tracking-[0.15em] text-gold/50">{word}</span>
                {i < activeWords.length - 1 && (
                  <span className="text-gold/25">·</span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
}
