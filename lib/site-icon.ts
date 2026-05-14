import { getSettings, getPublicSiteUrl } from "@/lib/data";
import { absoluteMediaUrl, normalizeMediaPath } from "@/lib/media-url";

/** لا نستخدم مسار favicon.ico في بيانات الأيقونة — يُعاد كتابته إلى /api/favicon فيُسبب حلقة وجلب 503. */
function pathnamePointsToFaviconAsset(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return p === "/favicon.ico" || p.endsWith("/favicon.ico");
}

function resolveTabIconFromSource(raw: string | null | undefined, base: string): string | null {
  if (!raw || !String(raw).trim()) return null;
  const pathNorm = normalizeMediaPath(String(raw).trim());
  if (pathNorm.startsWith("http")) {
    try {
      if (pathnamePointsToFaviconAsset(new URL(pathNorm).pathname)) return null;
    } catch {
      return null;
    }
    return pathNorm;
  }
  if (pathnamePointsToFaviconAsset(pathNorm)) return null;
  const abs = absoluteMediaUrl(base, pathNorm) ?? new URL(pathNorm, `${base.replace(/\/$/, "")}/`).href;
  try {
    if (pathnamePointsToFaviconAsset(new URL(abs).pathname)) return null;
  } catch {
    return null;
  }
  return abs;
}

/** رابط مطلق لأيقونة التبويب: Favicon ثم الشعار (مع تجنب مسار favicon.ico). */
export function getSiteTabIconUrl(): string | null {
  const s = getSettings();
  const base = getPublicSiteUrl();
  const fromFavicon = resolveTabIconFromSource(s.siteFavicon, base);
  if (fromFavicon) return fromFavicon;
  return resolveTabIconFromSource(s.logo, base);
}
