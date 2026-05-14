import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getSiteTabIconUrl } from "@/lib/site-icon";

export const dynamic = "force-dynamic";

function contentTypeForExt(ext: string): string {
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".ico") return "image/x-icon";
  if (ext === ".gif") return "image/gif";
  return "application/octet-stream";
}

/** ملف تحت public/uploads فقط، بدون .. */
function safeDiskPathForUploadsUrl(pathname: string): string | null {
  if (!pathname.startsWith("/uploads/")) return null;
  const rel = pathname.slice("/uploads/".length);
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) return null;
  const root = path.join(process.cwd(), "public", "uploads");
  const full = path.join(root, rel);
  if (!full.startsWith(root)) return null;
  return full;
}

/**
 * المتصفحات تطلب GET /favicon.ico؛ نُعيد الصورة من الإعدادات.
 * يُفضّل قراءة /uploads من القرص لتجنّب fetch قد يعيد الدخول في نفس المسار على بعض الاستضافات.
 */
export async function GET() {
  const iconUrl = getSiteTabIconUrl();
  if (!iconUrl) {
    return new NextResponse(null, { status: 404 });
  }

  let u: URL;
  try {
    u = new URL(iconUrl);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (u.pathname === "/favicon.ico" || u.pathname.toLowerCase().endsWith("/favicon.ico")) {
    return new NextResponse(null, { status: 404 });
  }

  const headers = {
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
  } as const;

  const diskPath = safeDiskPathForUploadsUrl(u.pathname);
  if (diskPath) {
    try {
      const buf = await readFile(diskPath);
      const ct = contentTypeForExt(path.extname(diskPath).toLowerCase());
      return new NextResponse(buf, { headers: { ...headers, "Content-Type": ct } });
    } catch {
      /* الملف غير موجود على القرص (مثلاً Blob فقط) → fetch */
    }
  }

  try {
    const r = await fetch(iconUrl, { cache: "no-store" });
    if (!r.ok) {
      return new NextResponse(null, { status: 502 });
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const ct = r.headers.get("content-type") || contentTypeForExt(path.extname(u.pathname).toLowerCase());
    return new NextResponse(buf, { headers: { ...headers, "Content-Type": ct } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
