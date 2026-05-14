import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
    return defaultValue;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function writeJson<T>(filename: string, data: T): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

/* ── Types ─────────────────────────────────────────────────────── */

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
  /** الموضع الذي يظهر فيه القسم على الصفحة الرئيسية. */
  position: VideoScrollPosition;
  /** مسار الفيديو (نسبي للـ /public أو رابط https كامل من Vercel Blob) */
  videoSrc: string;
  /** صورة معاينة اختيارية تظهر قبل تحميل الفيديو */
  posterSrc: string;
  /** الـ badge الذهبي فوق العنوان */
  label: string;
  /** العنوان الرئيسي */
  title: string;
  /** الوصف تحت العنوان */
  description: string;
  /** نص تلميح التمرير في الأسفل */
  scrollHint: string;
  /** طول مسافة التمرير (مضاعِف لارتفاع الشاشة) — 2 إلى 10 */
  scrollMultiplier: number;
  /** ناعم السكرول (ثوانٍ) — 0.1 إلى 2 */
  scrub: number;
  /** لون خلفية القسم */
  bgColor: string;
  /** اللون المميز (الذهبي / accent) */
  accentColor: string;
  /** شدة طبقة التظليل (vignette) — 0 إلى 1 */
  vignetteOpacity: number;
  /** هل يظهر شريط النصوص فوق الفيديو */
  showOverlay: boolean;
  /** هل يظهر زر "تخطي" */
  showSkip: boolean;
  /** نص زر التخطي */
  skipText: string;
}

/* ── Defaults — مضبوطة بعد عدة تجارب لأفضل سلاسة ─────────────── */

export const DEFAULT_VIDEO_SCROLL_CONFIG: VideoScrollConfig = {
  enabled: true,
  position: "after-projects",
  videoSrc: "/scroll-video.mp4",
  posterSrc: "",
  label: "تجربة بصرية",
  title: "اكتشف التفاصيل بحركة سلسة",
  description:
    "حرّك صفحتك للأسفل وشاهد كل لقطة تنبض بالحياة — كل بكسل مضبوط على إيقاع تمريرك.",
  scrollHint: "↓ مرّر للأسفل",
  /* 6× = 600vh: مسافة كافية للحركة بدون تطويل ممل.
     scrub 0.8 = نعومة عالية مع استجابة محسوسة. */
  scrollMultiplier: 6,
  scrub: 0.8,
  bgColor: "#2C2C2C",
  accentColor: "#C9A96E",
  vignetteOpacity: 0.55,
  showOverlay: true,
  showSkip: true,
  skipText: "تخطي",
};

/* ── I/O ────────────────────────────────────────────────────────── */

export function getVideoScrollConfig(): VideoScrollConfig {
  const stored = readJson<Partial<VideoScrollConfig>>(
    "video-scroll.json",
    DEFAULT_VIDEO_SCROLL_CONFIG
  );
  return { ...DEFAULT_VIDEO_SCROLL_CONFIG, ...stored };
}

export function saveVideoScrollConfig(config: VideoScrollConfig): void {
  writeJson("video-scroll.json", config);
}
