import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** طلب /favicon.ico الافتراضي من المتصفح → صورة من الإعدادات (بدل أيقونة Next/Vercel الافتراضية). */
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/api/favicon" }];
  },
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
