import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/data";
import fs from "fs";
import path from "path";

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PUT(request: Request) {
  const body = await request.json();
  saveSettings(body);

  /** عند تغيير الـ favicon أو الشعار، نسخ الملف إلى public/favicon.png
   *  حتى يظهر في تبويب المتصفح بشكل ثابت بغض النظر عن المسار الديناميكي. */
  const favSrc: string = (body.siteFavicon || body.logo || "").trim();
  if (favSrc && !favSrc.startsWith("http")) {
    try {
      const rel = favSrc.startsWith("/") ? favSrc.slice(1) : favSrc;
      const srcPath = path.join(process.cwd(), "public", rel);
      const destPath = path.join(process.cwd(), "public", "favicon.png");
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch {
      // لا نوقف الحفظ لو فشلت النسخة
    }
  }

  return NextResponse.json({ success: true });
}
