import { cookies } from "next/headers";
import type { SiteLocale } from "@/lib/locale-dict";
import { DEFAULT_LOCALE } from "@/lib/locale-dict";

const COOKIE = "site_locale";

export async function getSiteLocale(): Promise<SiteLocale> {
  const v = (await cookies()).get(COOKIE)?.value;
  return v === "en" ? "en" : DEFAULT_LOCALE;
}

export { COOKIE as SITE_LOCALE_COOKIE };
