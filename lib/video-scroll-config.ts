/**
 * Shared scroll-section config (canvas frame sequence).
 * Safe to import from Client Components — no Node.js APIs.
 */

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
  /** مجلد الإطارات تحت public، مثال: /frames */
  framesPath: string;
  /** عدد الإطارات frame_0001 … frame_NNNN */
  frameCount: number;
  /** jpg أو webp */
  frameExtension: string;
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

export const DEFAULT_VIDEO_SCROLL_CONFIG: VideoScrollConfig = {
  enabled: true,
  position: "after-bento",
  framesPath: "/frames",
  frameCount: 925,
  frameExtension: "jpg",
  label: "تجربة بصرية",
  title: "اكتشف التفاصيل بحركة سلسة",
  description:
    "حرّك صفحتك للأسفل وشاهد كل لقطة تنبض بالحياة — كل بكسل مضبوط على إيقاع تمريرك.",
  scrollHint: "مرّر للأسفل",
  scrollMultiplier: 20,
  scrub: 1,
  bgColor: "#2C2C2C",
  accentColor: "#C9A96E",
  vignetteOpacity: 0.55,
  showOverlay: true,
  showSkip: true,
  skipText: "تخطي",
};
