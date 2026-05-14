import type { MetadataRoute } from "next";
import { getPublishedArticles, getProjects, getPublicSiteUrl } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteUrl();
  const articles = getPublishedArticles();
  const projects = getProjects();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/portfolio`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/portfolio/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/blog/${a.slug}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages, ...articlePages];
}
