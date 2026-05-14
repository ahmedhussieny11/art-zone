import type { Metadata } from "next";
import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { getPublishedArticles } from "@/lib/data";
import { getSiteLocale } from "@/lib/get-site-locale";
import { getDict, t } from "@/lib/locale-dict";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const dict = getDict(locale);
  const blog = dict.blog as typeof dict.blog & { metaKeywords?: string[] };
  const keywords = Array.isArray(blog.metaKeywords) ? blog.metaKeywords : undefined;
  return {
    title: t(dict, "blog.metaTitle"),
    description: t(dict, "blog.metaDescription"),
    ...(keywords ? { keywords } : {}),
    openGraph: {
      title: t(dict, "blog.metaOgTitle"),
      description: t(dict, "blog.metaOgDescription"),
      type: "website",
      locale: locale === "en" ? "en_US" : "ar_SA",
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category: filterCategory, tag: filterTag } = await searchParams;
  const locale = await getSiteLocale();
  const dict = getDict(locale);
  const isRtl = locale === "ar";
  const dateLocale = isRtl ? "ar-SA" : "en-US";
  const textAlign = isRtl ? "text-right" : "text-left";
  const badgeCorner = isRtl ? "right-4" : "left-4";
  const readMoreHover = isRtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1";

  const allArticles = getPublishedArticles();

  const usedCategories = Array.from(new Set(allArticles.map((a) => a.category).filter(Boolean)));
  const usedTags = Array.from(new Set(allArticles.flatMap((a) => a.tags || []).filter(Boolean)));

  let articles = allArticles;
  if (filterCategory) articles = articles.filter((a) => a.category === filterCategory);
  if (filterTag) articles = articles.filter((a) => a.tags?.includes(filterTag));

  const sectionTitle = filterCategory
    ? t(dict, "blog.titleWithCategory", { cat: filterCategory })
    : filterTag
      ? t(dict, "blog.titleWithTag", { tag: filterTag })
      : t(dict, "blog.titleDefault");

  return (
    <>
      <section className="bg-charcoal pb-16 pt-32 md:pt-40 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeading
            label={t(dict, "blog.label")}
            title={sectionTitle}
            description={t(dict, "blog.description")}
            className="[&_h2]:text-white [&_p]:text-white/60"
          />
        </div>
      </section>

      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {(usedCategories.length > 0 || usedTags.length > 0) && (
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/blog"
                className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                  !filterCategory && !filterTag
                    ? "border-gold bg-gold text-white"
                    : "border-gray-200 bg-white text-warmgray hover:border-gold hover:text-gold dark:border-white/10 dark:bg-zinc-900 dark:text-offwhite/70"
                }`}
              >
                {t(dict, "blog.all")}
              </Link>
              {usedCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                    filterCategory === cat
                      ? "border-gold bg-gold text-white"
                      : "border-gray-200 bg-white text-warmgray hover:border-gold hover:text-gold dark:border-white/10 dark:bg-zinc-900 dark:text-offwhite/70"
                  }`}
                >
                  {cat}
                </Link>
              ))}
              {usedTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                    filterTag === tag
                      ? "border-gold bg-gold text-white"
                      : "border-gray-200 bg-white text-warmgray hover:border-gold hover:text-gold dark:border-white/10 dark:bg-zinc-900 dark:text-offwhite/70"
                  }`}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {articles.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, i) => (
                <FadeIn key={article._id} delay={i * 0.1}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className={`group block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-zinc-900/60 ${textAlign}`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {article.coverImage ? (
                        <UploadedImage
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <PlaceholderImage className="h-full w-full" />
                      )}
                      {article.category && (
                        <span className={`absolute top-4 rounded-full bg-gold/90 px-3 py-1 text-xs font-medium text-white ${badgeCorner}`}>
                          {article.category}
                        </span>
                      )}
                    </div>
                    <div className={`p-6 ${textAlign}`}>
                      <div className={`mb-3 flex items-center gap-3 text-xs text-warmgray ${isRtl ? "justify-end" : "justify-start"}`}>
                        <time dateTime={article.createdAt}>
                          {new Date(article.createdAt).toLocaleDateString(dateLocale, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                        <span>·</span>
                        <span>{article.author}</span>
                      </div>
                      <h2 className="font-serif text-xl font-light leading-snug text-charcoal transition-colors group-hover:text-gold">
                        {article.title}
                      </h2>
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-warmgray">{article.excerpt}</p>
                      <div className={`mt-4 flex items-center gap-2 text-xs font-medium text-gold ${isRtl ? "justify-end" : "justify-start"}`}>
                        {isRtl ? (
                          <>
                            {t(dict, "blog.readMore")}
                            <svg className={`h-3 w-3 transition-transform ${readMoreHover}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                          </>
                        ) : (
                          <>
                            {t(dict, "blog.readMore")}
                            <svg className={`h-3 w-3 transition-transform ${readMoreHover}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="font-serif text-xl text-warmgray">
                {filterCategory
                  ? t(dict, "blog.emptyCategory", { cat: filterCategory })
                  : filterTag
                    ? t(dict, "blog.emptyTag", { tag: filterTag })
                    : t(dict, "blog.emptyPublish")}
              </p>
              {(filterCategory || filterTag) && (
                <Link href="/blog" className="mt-4 inline-block text-sm font-medium text-gold hover:underline">
                  {t(dict, "blog.viewAll")}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
