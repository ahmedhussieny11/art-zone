import { NextResponse } from "next/server";
import { getSiteTabIconUrl } from "@/lib/site-icon";

export const dynamic = "force-dynamic";

/**
 * المتصفحات تطلب GET /favicon.ico تلقائياً؛ نُعيد الصورة من الإعدادات
 * (يُعاد توجيه /favicon.ico هنا عبر rewrites في next.config).
 */
export async function GET() {
  const iconUrl = getSiteTabIconUrl();
  if (!iconUrl) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const r = await fetch(iconUrl, { cache: "no-store" });
    if (!r.ok) {
      return new NextResponse(null, { status: 502 });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const ct = r.headers.get("content-type") || "image/png";
    return new NextResponse(buf, {
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
