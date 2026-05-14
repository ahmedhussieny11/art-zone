import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";
import { getLocalizedSettings } from "@/lib/localized-settings";
import type { SiteLocale } from "@/lib/locale-dict";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function localeFromCookie(request: Request): SiteLocale {
  const c = request.headers.get("cookie") || "";
  if (/\bsite_locale=en\b/.test(c)) return "en";
  return "ar";
}

export async function GET(request: Request) {
  const locale = localeFromCookie(request);
  const settings = getLocalizedSettings(getSettings(), locale);
  return NextResponse.json(settings, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
