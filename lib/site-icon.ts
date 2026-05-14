import { getSettings, getPublicSiteUrl } from "@/lib/data";
import { absoluteMediaUrl, normalizeMediaPath } from "@/lib/media-url";

/** رابط مطلق لأيقونة التبويب: Favicon ثم الشعار. */
export function getSiteTabIconUrl(): string | null {
  const s = getSettings();
  const favSource =
    (s.siteFavicon && s.siteFavicon.trim()) ||
    (s.logo && s.logo.trim()) ||
    "";
  if (!favSource) return null;
  const pathNorm = normalizeMediaPath(favSource);
  const base = getPublicSiteUrl();
  if (pathNorm.startsWith("http")) return pathNorm;
  return absoluteMediaUrl(base, pathNorm) ?? new URL(pathNorm, `${base.replace(/\/$/, "")}/`).href;
}
