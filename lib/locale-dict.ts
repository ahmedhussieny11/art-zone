import ar from "@/data/locales/ar.json";
import en from "@/data/locales/en.json";

export type SiteLocale = "ar" | "en";

export const DEFAULT_LOCALE: SiteLocale = "ar";

export type MessageDict = typeof ar;

const dicts: Record<SiteLocale, MessageDict> = { ar, en };

export function getDict(locale: SiteLocale): MessageDict {
  return dicts[locale] ?? ar;
}

function lookup(dict: MessageDict, path: string): string {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

/** Dot-path translation with optional {{var}} interpolation */
export function t(dict: MessageDict, path: string, vars?: Record<string, string>): string {
  let out = lookup(dict, path);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.split(`{{${k}}}`).join(v);
    }
  }
  return out;
}
