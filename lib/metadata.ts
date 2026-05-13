import type { Metadata } from "next";

const siteConfig = {
  name: "آرت زون للتصميم",
  description:
    "استوديو تصميم داخلي فاخر متخصص في المساحات السكنية والتجارية. نبتكر بيئات مميزة تجمع بين الأناقة والوظيفية والجماليات الخالدة.",
  url: "https://artzonedesign.com",
};

export function createMetadata(overrides: Partial<Metadata> = {}): Metadata {
  const title = overrides.title
    ? `${overrides.title} | ${siteConfig.name}`
    : siteConfig.name;
  const description =
    (overrides.description as string) || siteConfig.description;

  return {
    title,
    description,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      title: title as string,
      description,
      siteName: siteConfig.name,
      type: "website",
      locale: "ar_SA",
      ...(overrides.openGraph || {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title as string,
      description,
      ...(overrides.twitter || {}),
    },
    ...overrides,
  };
}

export { siteConfig };
