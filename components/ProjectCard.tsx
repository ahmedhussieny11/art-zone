"use client";

import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";
import PlaceholderImage from "./ui/PlaceholderImage";
import FadeIn from "./ui/FadeIn";
import { useSiteLocale } from "@/components/SiteProviders";

interface ProjectCardProps {
  title: string;
  slug: string;
  category: string;
  coverImage?: string | null;
  index?: number;
}

export default function ProjectCard({
  title,
  slug,
  category,
  coverImage,
  index = 0,
}: ProjectCardProps) {
  const { t } = useSiteLocale();
  const catKey = `categories.${category}`;
  const translated = t(catKey);
  const categoryLabel = translated !== catKey ? translated : category;

  return (
    <FadeIn delay={index * 0.1}>
      <Link href={`/portfolio/${slug}`} className="group block overflow-hidden">
        <div className="relative aspect-[3/4] overflow-hidden">
          {coverImage ? (
            <UploadedImage
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <PlaceholderImage
              className="h-full w-full transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
            <span className="text-[10px] font-semibold tracking-[0.15em] text-gold">
              {categoryLabel}
            </span>
            <h3 className="mt-1 font-serif text-base font-light leading-snug text-white md:text-lg">
              {title}
            </h3>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}
