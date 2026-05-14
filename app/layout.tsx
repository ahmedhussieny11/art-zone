import type { Metadata } from "next";
import { Amiri, Cairo } from "next/font/google";
import SiteShell from "@/components/SiteShell";
import SiteProviders from "@/components/SiteProviders";
import { getSettings, getPublicSiteUrl } from "@/lib/data";
import { getSiteLocale } from "@/lib/get-site-locale";
import { getLocalizedSettings } from "@/lib/localized-settings";
import { getDict } from "@/lib/locale-dict";
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
  const locale = await getSiteLocale();
  const s = getLocalizedSettings(getSettings(), locale);
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
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : "ar_SA",
      siteName: s.siteName,
    },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSettings();
  const locale = await getSiteLocale();
  const dict = getDict(locale);
  const c = settings.colors || DEFAULT_COLORS;
  const scale = Math.max(80, Math.min(150, Number(settings.fontScale) || 100));
  const iconPath = getIconPath();
  const darkModeEnabled = settings.darkModeEnabled === true;

  const themeCSS = `
    :root {
      --color-offwhite: ${c.offwhite || DEFAULT_COLORS.offwhite};
      --color-charcoal: ${c.charcoal || DEFAULT_COLORS.charcoal};
      --color-warmgray: ${c.warmgray || DEFAULT_COLORS.warmgray};
      --color-gold: ${c.gold || DEFAULT_COLORS.gold};
      --color-gold-light: ${c.goldLight || DEFAULT_COLORS.goldLight};
      --color-gold-dark: ${c.goldDark || DEFAULT_COLORS.goldDark};
    }
    html.dark {
      --color-offwhite: #13110f;
      --color-charcoal: #ebe7e2;
      --color-warmgray: #9a948d;
    }
    html { font-size: ${scale}% !important; }
  `;

  return (
    <html
      lang={locale === "en" ? "en" : "ar"}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${amiri.variable} ${cairo.variable} antialiased`}
      suppressHydrationWarning
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
        <SiteProviders
          initialLocale={locale}
          dict={dict}
          darkModeEnabled={darkModeEnabled}
        >
          <SiteShell>{children}</SiteShell>
        </SiteProviders>
      </body>
    </html>
  );
}
