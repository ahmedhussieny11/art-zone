import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/artcontrol/", "/api/admin/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
