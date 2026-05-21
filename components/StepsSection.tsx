"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSiteLocale } from "@/components/SiteProviders";
import type { SiteLocale } from "@/lib/locale-dict";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS_SCRUB_CLASS = "steps-scroll-scrub";

const STEP_ICONS: React.ReactNode[] = [
  (
    <svg key="i0" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  (
    <svg key="i1" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  (
    <svg key="i2" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 5.383a1.5 1.5 0 01-2.121 0l-.707-.707a1.5 1.5 0 010-2.121L8.59 12.34M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  (
    <svg key="i3" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
];

const DEFAULT_STEP_TEXT: { number: string; title: string; description: string }[] = [
  {
    number: "01",
    title: "الاستشارة",
    description:
      "نبدأ بجلسة استشارية مفصّلة لفهم رؤيتك واحتياجاتك وأسلوب حياتك، لنبني تصوّرًا واضحًا لمشروعك.",
  },
  {
    number: "02",
    title: "التصميم",
    description:
      "نحوّل أفكارك إلى تصاميم ثلاثية الأبعاد مع اختيار المواد والألوان والأثاث بعناية فائقة لتحقيق التناغم المثالي.",
  },
  {
    number: "03",
    title: "التنفيذ",
    description:
      "فريقنا المتخصص ينفّذ التصميم بأعلى معايير الجودة والدقة، مع متابعة يومية لضمان مطابقة النتائج للتصميم.",
  },
  {
    number: "04",
    title: "التسليم",
    description:
      "نسلّمك مساحتك الجديدة بكامل تفاصيلها مع ضمان رضاك التام، ونقدّم لك دعمًا مستمرًا بعد التسليم.",
  },
];

const EN_DEFAULT_STEP_TEXT: typeof DEFAULT_STEP_TEXT = [
  {
    number: "01",
    title: "Consultation",
    description:
      "We start with a detailed consultation to understand your vision, needs, and lifestyle, and to shape a clear direction for your project.",
  },
  {
    number: "02",
    title: "Design",
    description:
      "We translate your ideas into 3D designs with careful selection of materials, colours, and furniture for perfect harmony.",
  },
  {
    number: "03",
    title: "Execution",
    description:
      "Our specialist team delivers the design to the highest standards of quality and precision, with daily follow-up so the result matches the design.",
  },
  {
    number: "04",
    title: "Handover",
    description:
      "We hand over your new space in full detail with your complete satisfaction, and we continue to support you after delivery.",
  },
];

/** مسافة السكروب لكل مرحلة */
const SCROLL_VH_PER_STEP = 48;
/** scrub بسيط — تتبع مباشر مع السكروب */
const SCROLL_SCRUB = 0.65;

export type ProcessStepItem = { step: string; title: string; description: string };

type StepSlide = { number: string; title: string; description: string; icon: React.ReactNode };

function buildSlides(processSteps: ProcessStepItem[] | undefined, locale: SiteLocale): StepSlide[] {
  if (processSteps?.length) {
    return processSteps.map((s, i) => ({
      number: s.step?.trim() || String(i + 1).padStart(2, "0"),
      title: s.title,
      description: s.description,
      icon: STEP_ICONS[i % STEP_ICONS.length],
    }));
  }
  const rows = locale === "en" ? EN_DEFAULT_STEP_TEXT : DEFAULT_STEP_TEXT;
  return rows.map((row, i) => ({
    ...row,
    icon: STEP_ICONS[i],
  }));
}

interface StepsSectionProps {
  label?: string;
  title?: string;
  description?: string;
  processSteps?: ProcessStepItem[];
  labelSize?: string;
  titleSize?: string;
  bodySize?: string;
}

export default function StepsSection({
  label = "كيف نعمل",
  title = "أنشئ مساحتك المثالية في ٤ خطوات بسيطة",
  description = "نحوّل رؤيتك إلى واقع من خلال عملية مدروسة تضمن أعلى جودة في كل مرحلة.",
  processSteps,
  labelSize = "sm",
  titleSize = "5xl",
  bodySize = "lg",
}: StepsSectionProps) {
  const { t, locale } = useSiteLocale();
  const slides = useMemo(() => buildSlides(processSteps, locale), [processSteps, locale]);
  const n = slides.length;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const panel = panelRef.current;
    if (!wrapper || !panel || n < 1) return;

    const setHtmlScrub = (on: boolean) => {
      document.documentElement.classList.toggle(STEPS_SCRUB_CLASS, on);
    };

    const applyProgress = (progress: number) => {
      setActiveStep(
        n <= 1 ? 0 : Math.min(n - 1, Math.round(progress * (n - 1))),
      );
    };

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      pin: panel,
      pinSpacing: false,
      scrub: SCROLL_SCRUB,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => applyProgress(self.progress),
      onEnter: () => setHtmlScrub(true),
      onLeave: () => setHtmlScrub(false),
      onEnterBack: () => setHtmlScrub(true),
      onLeaveBack: () => setHtmlScrub(false),
    });

    stRef.current = trigger;
    applyProgress(trigger.progress);
    ScrollTrigger.refresh();

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      trigger.kill();
      stRef.current = null;
      setHtmlScrub(false);
    };
  }, [n]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      const st = stRef.current;
      if (!st) return;
      const progress = n <= 1 ? 0 : stepIndex / (n - 1);
      const scrollY = st.start + progress * (st.end - st.start);
      window.scrollTo({ top: scrollY, behavior: "smooth" });
    },
    [n],
  );

  const LABEL_SIZE: Record<string, string> = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };
  const TITLE_SIZE: Record<string, string> = {
    "3xl": "text-3xl md:text-4xl",
    "4xl": "text-4xl md:text-5xl",
    "5xl": "text-4xl md:text-5xl lg:text-6xl",
    "6xl": "text-5xl md:text-6xl lg:text-7xl",
  };
  const BODY_SIZE: Record<string, string> = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg md:text-xl",
    xl: "text-xl md:text-2xl",
  };

  const labelCls = LABEL_SIZE[labelSize] ?? LABEL_SIZE.sm;
  const titleCls = TITLE_SIZE[titleSize] ?? TITLE_SIZE["5xl"];
  const bodyCls = BODY_SIZE[bodySize] ?? BODY_SIZE.lg;
  const contentDir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      ref={wrapperRef}
      className="relative bg-offwhite"
      style={{ height: `${n * SCROLL_VH_PER_STEP}vh` }}
    >
      <div ref={panelRef} className="relative z-10 h-screen w-full overflow-hidden bg-offwhite">
        <div className="relative flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div
              dir="ltr"
              className="flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-center lg:gap-12 xl:gap-20"
            >
              <motion.div
                dir={contentDir}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`order-1 min-w-0 flex-1 lg:order-2 lg:max-w-md ${
                  contentDir === "rtl" ? "text-right" : "text-left"
                }`}
              >
                <span className={`mb-3 inline-block font-semibold tracking-[0.2em] text-gold sm:mb-4 ${labelCls}`}>
                  {label}
                </span>
                <h2 className={`font-serif font-light leading-[1.15] text-charcoal ${titleCls}`}>{title}</h2>
                <p className={`mt-4 leading-relaxed text-warmgray/90 sm:mt-5 ${bodyCls}`}>{description}</p>
              </motion.div>

              <div className="order-2 min-w-0 flex-1 lg:order-1 lg:max-w-xl">
                <StepsTextColumn
                  slides={slides}
                  activeStep={activeStep}
                  contentDir={contentDir}
                  onGoToStep={goToStep}
                  t={t}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepsTextColumn({
  slides,
  activeStep,
  contentDir,
  onGoToStep,
  t,
}: {
  slides: StepSlide[];
  activeStep: number;
  contentDir: "rtl" | "ltr";
  onGoToStep: (i: number) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}) {
  return (
    <div
      dir={contentDir}
      className="flex max-h-[min(70vh,500px)] w-full flex-col gap-2 overflow-y-auto overscroll-contain pr-1 sm:gap-2.5 lg:max-h-[calc(100vh-5rem)] lg:pr-0"
    >
      {slides.map((step, i) => {
        const isActive = i === activeStep;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onGoToStep(i)}
            aria-current={isActive ? "step" : undefined}
            aria-label={t("steps.goToStep", { n: String(i + 1), title: step.title })}
            className={`w-full cursor-pointer rounded-2xl border text-start transition-all duration-300 ease-out focus:outline-none ${
              isActive
                ? "border-gold/30 bg-white px-4 py-4 shadow-md shadow-charcoal/10 sm:px-5 sm:py-5"
                : "border-transparent bg-white/40 px-3 py-3 opacity-75 hover:opacity-90 sm:px-4 sm:py-3.5"
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className={`flex shrink-0 items-center justify-center rounded-xl bg-gold text-white transition-all duration-300 ${
                  isActive ? "h-12 w-12 shadow-md shadow-gold/25 sm:h-14 sm:w-14" : "h-10 w-10 opacity-80"
                }`}
              >
                {step.icon}
              </div>
              <div className="min-w-0 flex-1">
                <span className="mb-0.5 block font-serif text-xs tracking-[0.12em] text-gold/90">
                  {step.number}
                </span>
                <h3
                  className={`font-serif font-light leading-snug transition-all duration-300 ${
                    isActive
                      ? "text-lg text-charcoal sm:text-xl"
                      : "text-base text-charcoal/80"
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`mt-1.5 leading-relaxed transition-all duration-300 ${
                    isActive
                      ? "text-sm text-warmgray sm:text-[0.95rem]"
                      : "text-xs text-warmgray/80 sm:text-sm"
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
