"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "الاستشارة",
    description:
      "نبدأ بجلسة استشارية مفصّلة لفهم رؤيتك واحتياجاتك وأسلوب حياتك، لنبني تصوّرًا واضحًا لمشروعك.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "التصميم",
    description:
      "نحوّل أفكارك إلى تصاميم ثلاثية الأبعاد مع اختيار المواد والألوان والأثاث بعناية فائقة لتحقيق التناغم المثالي.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "التنفيذ",
    description:
      "فريقنا المتخصص ينفّذ التصميم بأعلى معايير الجودة والدقة، مع متابعة يومية لضمان مطابقة النتائج للتصميم.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 5.383a1.5 1.5 0 01-2.121 0l-.707-.707a1.5 1.5 0 010-2.121L8.59 12.34M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "التسليم",
    description:
      "نسلّمك مساحتك الجديدة بكامل تفاصيلها مع ضمان رضاك التام، ونقدّم لك دعمًا مستمرًا بعد التسليم.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
];

type PanelState = "before" | "pinned" | "after";

interface StepsSectionProps {
  label?: string;
  title?: string;
  description?: string;
  labelSize?: string;
  titleSize?: string;
  bodySize?: string;
}

export default function StepsSection({
  label = "كيف نعمل",
  title = "أنشئ مساحتك المثالية في ٤ خطوات بسيطة",
  description = "نحوّل رؤيتك إلى واقع من خلال عملية مدروسة تضمن أعلى جودة في كل مرحلة.",
  labelSize = "sm",
  titleSize = "5xl",
  bodySize = "lg",
}: StepsSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>("before");
  const [scrollProgress, setScrollProgress] = useState(0);

  const update = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrolled = -rect.top;
    const scrollable = wrapper.offsetHeight - vh;

    if (scrolled <= 0) {
      setPanelState("before");
      setScrollProgress(0);
      setActiveStep(0);
    } else if (scrolled >= scrollable) {
      setPanelState("after");
      setScrollProgress(1);
      setActiveStep(steps.length - 1);
    } else {
      setPanelState("pinned");
      const progress = scrolled / scrollable;
      setScrollProgress(progress);
      const idx = Math.min(Math.floor(progress * steps.length), steps.length - 1);
      if (idx !== activeStep) {
        setPrevStep(activeStep);
        setActiveStep(idx);
      }
    }
  }, [activeStep]);

  useEffect(() => {
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const goToStep = useCallback((stepIndex: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const vh = window.innerHeight;
    const scrollable = wrapper.offsetHeight - vh;
    // Place target in the middle of that step's range
    const stepProgress = (stepIndex + 0.1) / steps.length;
    const targetScroll = wrapper.offsetTop + stepProgress * scrollable;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, []);

  const panelCls =
    panelState === "pinned"
      ? "fixed inset-x-0 top-0 z-10 h-screen"
      : panelState === "after"
      ? "absolute inset-x-0 bottom-0 h-screen"
      : "absolute inset-x-0 top-0 h-screen";

  const direction = activeStep > prevStep ? 1 : -1;
  const current = steps[activeStep];

  const LABEL_SIZE: Record<string, string> = {
    xs: "text-xs", sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl",
  };
  const TITLE_SIZE: Record<string, string> = {
    "3xl": "text-3xl md:text-4xl",
    "4xl": "text-4xl md:text-5xl",
    "5xl": "text-4xl md:text-5xl lg:text-6xl",
    "6xl": "text-5xl md:text-6xl lg:text-7xl",
  };
  const BODY_SIZE: Record<string, string> = {
    sm: "text-sm", base: "text-base",
    lg: "text-lg md:text-xl", xl: "text-xl md:text-2xl",
  };

  const labelCls = LABEL_SIZE[labelSize] ?? LABEL_SIZE.sm;
  const titleCls = TITLE_SIZE[titleSize] ?? TITLE_SIZE["5xl"];
  const bodyCls = BODY_SIZE[bodySize] ?? BODY_SIZE.lg;

  // progress bar height covers up to the center of the last circle
  const progressPct = scrollProgress * 100;

  return (
    <div
      ref={wrapperRef}
      className="relative bg-offwhite"
      style={{ height: `${steps.length * 100}vh` }}
    >
      <div className={`${panelCls} bg-offwhite`}>
        <div className="flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-20">

              {/* ── Right col (RTL): heading + step numbers ── */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className={`mb-4 inline-block font-semibold tracking-[0.15em] text-gold ${labelCls}`}>
                    {label}
                  </span>
                  <h2 className={`font-serif font-light leading-tight text-charcoal ${titleCls}`}>
                    {title}
                  </h2>
                  <p className={`mt-5 leading-relaxed text-warmgray ${bodyCls}`}>
                    {description}
                  </p>
                </motion.div>

                {/* Step number pills — desktop */}
                <div className="mt-12 hidden lg:flex lg:flex-col lg:gap-0">
                  {/* Outer wrapper for track + pills */}
                  <div className="relative w-fit">
                    {/* Full track line */}
                    <div
                      className="absolute right-[17px] top-[17px] w-px bg-warmgray/15"
                      style={{ height: `calc(100% - 34px)` }}
                    />
                    {/* Filled progress line — grows from top to active circle center */}
                    <div
                      className="absolute right-[17px] top-[17px] w-px origin-top bg-gold transition-none"
                      style={{ height: `${progressPct}%`, maxHeight: "calc(100% - 34px)" }}
                    />

                    {steps.map((step, i) => {
                      const isActive = i === activeStep;
                      const isPast = i < activeStep;

                      return (
                        <button
                          key={i}
                          onClick={() => goToStep(i)}
                          className="group relative flex cursor-pointer items-center gap-4 py-3 focus:outline-none"
                          aria-label={`انتقل إلى الخطوة ${i + 1}: ${step.title}`}
                        >
                          {/* Circle */}
                          <div
                            className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                              isActive
                                ? "border-gold bg-gold scale-110 shadow-md shadow-gold/30"
                                : isPast
                                ? "border-gold bg-gold"
                                : "border-warmgray/25 bg-offwhite group-hover:border-gold/50"
                            }`}
                          >
                            <span
                              className={`text-sm font-semibold leading-none transition-colors duration-500 ${
                                isActive || isPast
                                  ? "text-white"
                                  : "text-warmgray/50 group-hover:text-warmgray"
                              }`}
                            >
                              {i + 1}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Left col (RTL): one card at a time ── */}
              <div className="lg:col-span-3">
                <div className="relative h-56 overflow-hidden md:h-48">
                  <AnimatePresence initial={false} mode="sync">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0.4, y: direction > 0 ? "105%" : "-105%" }}
                      animate={{ opacity: 1, y: "0%" }}
                      exit={{ opacity: 0.4, y: direction > 0 ? "-105%" : "105%" }}
                      transition={{
                        duration: 0.55,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      className="absolute inset-0 rounded-3xl border border-gold/20 bg-white p-8 shadow-xl shadow-charcoal/5 md:p-10"
                    >
                      <div className="flex h-full items-start gap-5">
                        {/* Icon badge */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold text-white shadow-md shadow-gold/30">
                          {current.icon}
                        </div>
                        <div>
                          <span className="mb-2 block font-serif text-sm tracking-[0.12em] text-gold/80">
                            {current.number}
                          </span>
                          <h3 className="font-serif text-xl font-light text-charcoal md:text-2xl">
                            {current.title}
                          </h3>
                          <p className="mt-3 text-base leading-relaxed text-warmgray">
                            {current.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Mobile dots — tappable */}
                <div className="mt-10 flex justify-center gap-3 lg:hidden">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToStep(i)}
                      aria-label={`الخطوة ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-500 focus:outline-none ${
                        i === activeStep
                          ? "w-8 bg-gold"
                          : i < activeStep
                          ? "w-2 bg-gold/50"
                          : "w-2 bg-warmgray/25"
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
