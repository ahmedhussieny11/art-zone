import type { Metadata } from "next";
import { Amiri, Cairo } from "next/font/google";
import SiteShell from "@/components/SiteShell";
import { getSettings } from "@/lib/data";
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

export const metadata: Metadata = {
  title: {
    default: "آرت زون للتصميم | تصميم داخلي فاخر",
    template: "%s | آرت زون للتصميم",
  },
  description:
    "استوديو تصميم داخلي فاخر متخصص في المساحات السكنية والتجارية. نبتكر بيئات مميزة تجمع بين الأناقة والوظيفية والجماليات الخالدة.",
  keywords: [
    "تصميم داخلي",
    "تصميم فاخر",
    "تصميم سكني",
    "تصميم تجاري",
    "تشطيبات",
    "آرت زون للتصميم",
  ],
};

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
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
