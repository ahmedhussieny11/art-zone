import { NextResponse } from "next/server";
import type { SiteLocale } from "@/lib/locale-dict";
import { SITE_LOCALE_COOKIE } from "@/lib/get-site-locale";

export async function POST(request: Request) {
  let locale: SiteLocale = "ar";
  try {
    const body = await request.json();
    if (body?.locale === "en") locale = "en";
  } catch {
    /* ignore */
  }

  const res = NextResponse.json({ ok: true, locale });
  res.cookies.set(SITE_LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
    sameSite: "lax",
    httpOnly: false,
  });
  return res;
}
