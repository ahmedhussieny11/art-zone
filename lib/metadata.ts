import type { Metadata } from "next";
import { getSettings, getPublicSiteUrl } from "@/lib/data";

export function createMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const s = getSettings();
  const base = getPublicSiteUrl();
  const name = s.siteName;
  const tpl = s.siteTitleTemplate?.includes("%s") ? s.siteTitleTemplate : `%s | ${name}`;

  const rawTitle = overrides.title;
  const title =
    typeof rawTitle === "string"
      ? tpl.replace("%s", rawTitle)
      : (rawTitle ?? (s.siteDefaultTitle || name));
  const description = (overrides.description as string) || s.siteDescription;
  const keywords =
    Array.isArray(s.siteSeoKeywords) && s.siteSeoKeywords.length > 0 ? s.siteSeoKeywords : undefined;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    metadataBase: new URL(base),
    openGraph: {
      title: typeof title === "string" ? title : name,
      description,
      siteName: name,
      type: "website",
      locale: "ar_SA",
      ...(overrides.openGraph || {}),
    },
    twitter: {
      card: "summary_large_image",
      title: typeof title === "string" ? title : name,
      description,
      ...(overrides.twitter || {}),
    },
    ...overrides,
  };
}

export function getSiteConfigForMetadata() {
  const s = getSettings();
  return {
    name: s.siteName,
    description: s.siteDescription,
    url: getPublicSiteUrl(),
  };
}
