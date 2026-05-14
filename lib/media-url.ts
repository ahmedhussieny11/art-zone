/** يبني رابطاً مطلقاً لصورة الغلاف أو OG — يدعم `/uploads/...` وروابط https (مثل Vercel Blob). */
export function absoluteMediaUrl(siteBase: string, pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) return undefined;
  const t = pathOrUrl.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const base = siteBase.replace(/\/$/, "");
  const path = t.startsWith("/") ? t : `/${t}`;
  return `${base}${path}`;
}
