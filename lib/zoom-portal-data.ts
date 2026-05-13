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

export interface ZoomPortalHotspot {
  id: string;
  x: number;          // 0-100  percentage from left
  y: number;          // 0-100  percentage from top
  title: string;
  value: string;
  note?: string;
  scrollStart: number; // 0-1 global scroll progress
  scrollEnd: number;   // 0-1 global scroll progress
}

export interface ZoomPortalLayer {
  id: string;
  src: string;
  label: string;
  zoomOriginX: number;   // 0-100
  zoomOriginY: number;   // 0-100
  maxZoom: number;       // 1-20  — how deep the zoom goes
  entryScale: number;    // 0.1-1 — size when layer enters (for layers 2+)
  hotspots: ZoomPortalHotspot[];
}

export interface ZoomPortalConfig {
  enabled: boolean;
  scrollHeight: string;
  bgColor: string;
  vignetteOpacity: number;
  grainOpacity: number;
  accentColor: string;
  topBadge: string;
  topHint: string;
  finalTitle: string;
  finalTitleColor: string;
  finalSub: string;
  finalSubColor: string;
  cta1Text: string;
  cta1Link: string;
  cta1Bg: string;
  cta1Color: string;
  cta2Text: string;
  cta2Link: string;
  cta2Color: string;
  layers: ZoomPortalLayer[];
}

/* ── Defaults ──────────────────────────────────────────────────── */

const DEFAULT_CONFIG: ZoomPortalConfig = {
  enabled: true,
  scrollHeight: "500vh",
  bgColor: "#2C2C2C",
  vignetteOpacity: 0.72,
  grainOpacity: 0.04,
  accentColor: "#C9A96E",
  topBadge: "بوابة التصميم",
  topHint: "انزل لتدخل عالمنا",
  finalTitle: "كل تفصيلة تحكي قصة",
  finalTitleColor: "#ffffff",
  finalSub: "من السفرة إلى الانتريه — نصمم مساحات تعيش فيها التفاصيل",
  finalSubColor: "rgba(255,255,255,0.50)",
  cta1Text: "استكشف أعمالنا",
  cta1Link: "/portfolio",
  cta1Bg: "#C9A96E",
  cta1Color: "#ffffff",
  cta2Text: "تواصل معنا",
  cta2Link: "/contact",
  cta2Color: "rgba(255,255,255,0.70)",
  layers: [
    {
      id: "layer-1",
      src: "/portal-1-overview.jpg",
      label: "زون آرت",
      zoomOriginX: 50,
      zoomOriginY: 50,
      maxZoom: 8,
      entryScale: 0.5,
      hotspots: [
        { id: "h1", x: 15, y: 43, title: "حائط الرخام", value: "رخام طبيعي Breccia", note: "استيراد إيطالي", scrollStart: 0.03, scrollEnd: 0.17 },
        { id: "h2", x: 48, y: 82, title: "الأرضية", value: "سيراميك رمادي براق ٦٠×٦٠", scrollStart: 0.06, scrollEnd: 0.17 },
        { id: "h3", x: 40, y: 10, title: "الإضاءة", value: "Track Light LED", note: "٣٠٠٠ كلفن - ضوء دافئ", scrollStart: 0.09, scrollEnd: 0.17 },
      ],
    },
    {
      id: "layer-2",
      src: "/portal-2-dining.jpg",
      label: "السفرة",
      zoomOriginX: 50,
      zoomOriginY: 50,
      maxZoom: 8,
      entryScale: 0.45,
      hotspots: [
        { id: "h4", x: 15, y: 40, title: "حائط الرخام", value: "رخام بريتشيا فينيتو", note: "قطعة واحدة متصلة", scrollStart: 0.28, scrollEnd: 0.44 },
        { id: "h5", x: 35, y: 72, title: "الكراسي", value: "خشب زان طبيعي", note: "مقعد قماش كريم", scrollStart: 0.31, scrollEnd: 0.44 },
        { id: "h6", x: 58, y: 55, title: "طاولة السفرة", value: "خشب بلوط طبيعي", note: "قاعدة إيبوكسي أبيض", scrollStart: 0.34, scrollEnd: 0.44 },
      ],
    },
    {
      id: "layer-3",
      src: "/portal-3-living.jpg",
      label: "الانتريه",
      zoomOriginX: 50,
      zoomOriginY: 50,
      maxZoom: 8,
      entryScale: 0.45,
      hotspots: [
        { id: "h7", x: 42, y: 55, title: "الأريكة", value: "قماش بوكليه بيج", note: "تصميم كونتيمبوراري", scrollStart: 0.63, scrollEnd: 0.73 },
        { id: "h8", x: 70, y: 78, title: "الأرضية", value: "سيراميك رمادي مط ٦٠×٦٠", scrollStart: 0.65, scrollEnd: 0.73 },
        { id: "h9", x: 78, y: 32, title: "الستائر", value: "قماش لينن بيج", note: "تفصيل مزدوج", scrollStart: 0.67, scrollEnd: 0.73 },
      ],
    },
  ],
};

/* ── I/O ────────────────────────────────────────────────────────── */

export function getZoomPortalConfig(): ZoomPortalConfig {
  const stored = readJson<Partial<ZoomPortalConfig>>("zoom-portal.json", DEFAULT_CONFIG);
  return { ...DEFAULT_CONFIG, ...stored };
}

export function saveZoomPortalConfig(config: ZoomPortalConfig): void {
  writeJson("zoom-portal.json", config);
}
