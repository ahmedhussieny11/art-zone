import fs from "fs";
import path from "path";
import type { SiteSettings } from "@/lib/data";
import type { SiteLocale } from "@/lib/locale-dict";

const LOCALES_DIR = path.join(process.cwd(), "data", "locales");
const SETTINGS_EN_FILE = path.join(LOCALES_DIR, "settings-en.json");

let cachedEnOverlay: Partial<SiteSettings> | null = null;

function loadSettingsEnOverlay(): Partial<SiteSettings> {
  if (cachedEnOverlay) return cachedEnOverlay;
  try {
    if (fs.existsSync(SETTINGS_EN_FILE)) {
      const raw = fs.readFileSync(SETTINGS_EN_FILE, "utf-8");
      cachedEnOverlay = JSON.parse(raw) as Partial<SiteSettings>;
      return cachedEnOverlay;
    }
  } catch {
    /* ignore */
  }
  cachedEnOverlay = {};
  return cachedEnOverlay;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** دمج تراكب الإنجليزية فوق إعدادات الموقع (للعرض فقط) */
export function getLocalizedSettings(settings: SiteSettings, locale: SiteLocale): SiteSettings {
  if (locale !== "en") return settings;
  const overlay = loadSettingsEnOverlay();
  return deepMergeSiteSettings(settings, overlay);
}

function deepMergeSiteSettings(base: SiteSettings, overlay: Partial<SiteSettings>): SiteSettings {
  const out = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(overlay) as (keyof SiteSettings)[]) {
    const v = overlay[key];
    if (v === undefined) continue;
    const b = base[key];
    if (Array.isArray(v)) {
      out[key as string] = v;
      continue;
    }
    if (isPlainObject(v) && isPlainObject(b)) {
      out[key as string] = { ...(b as Record<string, unknown>), ...v };
      continue;
    }
    out[key as string] = v;
  }
  return out as unknown as SiteSettings;
}
