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

export interface VideoScrollConfig {
  /** إظهار / إخفاء القسم في الصفحة الرئيسية */
  enabled: boolean;
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
}

/* ── Defaults ──────────────────────────────────────────────────── */

const DEFAULT_CONFIG: VideoScrollConfig = {
  enabled: true,
  videoSrc: "/scroll-video.mp4",
  posterSrc: "",
  label: "تجربة بصرية",
  title: "اكتشف التفاصيل بحركة سلسة",
  description:
    "حرّك صفحتك للأسفل وشاهد كل لقطة تنبض بالحياة — كل بكسل مضبوط على إيقاع تمريرك.",
  scrollHint: "↓ مرّر للأسفل",
  scrollMultiplier: 6,
  scrub: 0.7,
  bgColor: "#2C2C2C",
  accentColor: "#C9A96E",
  vignetteOpacity: 0.55,
  showOverlay: true,
};

/* ── I/O ────────────────────────────────────────────────────────── */

export function getVideoScrollConfig(): VideoScrollConfig {
  const stored = readJson<Partial<VideoScrollConfig>>(
    "video-scroll.json",
    DEFAULT_CONFIG
  );
  return { ...DEFAULT_CONFIG, ...stored };
}

export function saveVideoScrollConfig(config: VideoScrollConfig): void {
  writeJson("video-scroll.json", config);
}
