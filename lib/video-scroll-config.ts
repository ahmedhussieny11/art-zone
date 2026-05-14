/**
 * Shared video-scroll section config (types + defaults + UI labels).
 * Safe to import from Client Components — no Node.js APIs.
 */

/** كل موضع ممكن يظهر فيه القسم على الصفحة الرئيسية. */
export type VideoScrollPosition =
  | "after-hero"
  | "after-bento"
  | "after-brand-slider"
  | "after-projects"
  | "after-zoom-portal"
  | "after-steps"
  | "after-testimonials"
  | "after-articles";

export const POSITION_OPTIONS: { value: VideoScrollPosition; label: string }[] =
  [
    { value: "after-hero", label: "بعد البانر الرئيسي" },
    { value: "after-bento", label: "بعد قسم «عن الشركة»" },
    { value: "after-brand-slider", label: "بعد سلايدر الصور" },
    { value: "after-projects", label: "بعد المشاريع المميزة" },
    { value: "after-zoom-portal", label: "بعد بوابة التصميم" },
    { value: "after-steps", label: "بعد خطوات العمل" },
    { value: "after-testimonials", label: "بعد آراء العملاء" },
    { value: "after-articles", label: "بعد آخر المقالات" },
  ];

export interface VideoScrollConfig {
  enabled: boolean;
  position: VideoScrollPosition;
  videoSrc: string;
  posterSrc: string;
  label: string;
  title: string;
  description: string;
  scrollHint: string;
  scrollMultiplier: number;
  scrub: number;
  bgColor: string;
  accentColor: string;
  vignetteOpacity: number;
  showOverlay: boolean;
  showSkip: boolean;
  skipText: string;
}

/** إعدادات افتراضية مُحسَّنة للسلاسة. */
export const DEFAULT_VIDEO_SCROLL_CONFIG: VideoScrollConfig = {
  enabled: true,
  position: "after-projects",
  videoSrc: "/scroll-video.mp4",
  posterSrc: "",
  label: "تجربة بصرية",
  title: "اكتشف التفاصيل بحركة سلسة",
  description:
    "حرّك صفحتك للأسفل وشاهد كل لقطة تنبض بالحياة — كل بكسل مضبوط على إيقاع تمريرك.",
  scrollHint: "مرّر للأسفل",
  scrollMultiplier: 6,
  scrub: 0.55,
  bgColor: "#2C2C2C",
  accentColor: "#C9A96E",
  vignetteOpacity: 0.55,
  showOverlay: true,
  showSkip: true,
  skipText: "تخطي",
};
