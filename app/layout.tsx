import type { Metadata } from "next";
import { Amiri, Cairo } from "next/font/google";
import SiteShell from "@/components/SiteShell";
import { getSettings, getPublicSiteUrl } from "@/lib/data";
import { normalizeMediaPath } from "@/lib/media-url";
import fs from "fs";
import path from "path";
import "./globals.css";

export const dynamic = "force-dynamic";

const amiri = Amiri({
  variable: "--font-playfair",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-inter",
  subsets: ["arabic", "latin"],
  display: "swap",
});

/** مسار أيقونة التبويب:
 *  - /favicon.png لو الملف موجود (يُنسخ عند حفظ الإعدادات)
 *  - وإلا المسار المحفوظ في الإعدادات مباشرةً (Blob URL أو uploads) */
function getIconPath(): string | null {
  const staticFavicon = path.join(process.cwd(), "public", "favicon.png");
  if (fs.existsSync(staticFavicon)) return "/favicon.png";
  const s = getSettings();
  const raw = (s.siteFavicon && s.siteFavicon.trim()) || (s.logo && s.logo.trim()) || "";
  return raw ? normalizeMediaPath(raw) : null;
}

export async function generateMetadata(): Promise<Metadata> {
  const s = getSettings();
  const base = getPublicSiteUrl();
  const defaultTitle = (s.siteDefaultTitle && s.siteDefaultTitle.trim()) || s.siteName;
  let template = (s.siteTitleTemplate && s.siteTitleTemplate.trim()) || `%s | ${s.siteName}`;
  if (!template.includes("%s")) template = `%s | ${s.siteName}`;
  const keywords = Array.isArray(s.siteSeoKeywords) && s.siteSeoKeywords.length > 0 ? s.siteSeoKeywords : undefined;

  return {
    metadataBase: new URL(base),
    title: { default: defaultTitle, template },
    description: s.siteDescription,
    ...(keywords ? { keywords } : {}),
    openGraph: { type: "website", locale: "ar_SA", siteName: s.siteName },
  };
}

const DEFAULT_COLORS = {
  offwhite: "#F5F0EB",
  charcoal: "#2C2C2C",
  warmgray: "#8A8078",
  gold: "#C9A96E",
  goldLight: "#D4BA8A",
  goldDark: "#B89555",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSettings();
  const c = settings.colors || DEFAULT_COLORS;
  const scale = Math.max(80, Math.min(150, Number(settings.fontScale) || 100));
  const iconPath = getIconPath();

  const themeCSS = `
    :root, *, *::before, *::after {
      --color-offwhite: ${c.offwhite || DEFAULT_COLORS.offwhite} !important;
      --color-charcoal: ${c.charcoal || DEFAULT_COLORS.charcoal} !important;
      --color-warmgray: ${c.warmgray || DEFAULT_COLORS.warmgray} !important;
      --color-gold: ${c.gold || DEFAULT_COLORS.gold} !important;
      --color-gold-light: ${c.goldLight || DEFAULT_COLORS.goldLight} !important;
      --color-gold-dark: ${c.goldDark || DEFAULT_COLORS.goldDark} !important;
    }
    html { font-size: ${scale}% !important; }
  `;

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${amiri.variable} ${cairo.variable} antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        {iconPath && (
          <>
            <link rel="icon" href={iconPath} />
            <link rel="shortcut icon" href={iconPath} />
            <link rel="apple-touch-icon" href={iconPath} />
          </>
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
