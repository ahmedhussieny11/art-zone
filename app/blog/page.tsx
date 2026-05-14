import type { Metadata } from "next";
import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { getPublishedArticles, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المدونة",
  description: "مقالات ونصائح في التصميم الداخلي والديكور من خبراء آرت زون. اكتشف أحدث الاتجاهات وأفضل النصائح لتصميم مساحتك.",
  keywords: ["مدونة تصميم داخلي", "نصائح ديكور", "اتجاهات التصميم", "مقالات تصميم"],
  openGraph: {
    title: "مدونة آرت زون للتصميم",
    description: "مقالات ونصائح في التصميم الداخلي والديكور من خبراء آرت زون.",
    type: "website",
    locale: "ar_SA",
  },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string; tag?: string }> }) {
  const { category: filterCategory, tag: filterTag } = await searchParams;
  const allArticles = getPublishedArticles();

  const usedCategories = Array.from(new Set(allArticles.map((a) => a.category).filter(Boolean)));
  const usedTags = Array.from(new Set(allArticles.flatMap((a) => a.tags || []).filter(Boolean)));

  let articles = allArticles;
  if (filterCategory) articles = articles.filter((a) => a.category === filterCategory);
  if (filterTag) articles = articles.filter((a) => a.tags?.includes(filterTag));

  return (
    <>
      <section className="bg-charcoal pb-16 pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeading
            label="المدونة"
            title={filterCategory ? `مقالات: ${filterCategory}` : filterTag ? `وسم: ${filterTag}` : "مقالات ونصائح"}
            description="أحدث المقالات والنصائح في عالم التصميم الداخلي والديكور من خبراء آرت زون."
            className="[&_h2]:text-white [&_p]:text-white/60"
          />
        </div>
      </section>

      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {usedCategories.length > 0 && (
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/blog"
                className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                  !filterCategory && !filterTag
                    ? "border-gold bg-gold text-white"
                    : "border-gray-200 bg-white text-warmgray hover:border-gold hover:text-gold"
                }`}
              >
                الكل
              </Link>
              {usedCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/blog?category=${encodeURIComponent(cat)}`}
                  className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                    filterCategory === cat
                      ? "border-gold bg-gold text-white"
                      : "border-gray-200 bg-white text-warmgray hover:border-gold hover:text-gold"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {articles.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, i) => (
                <FadeIn key={article._id} delay={i * 0.1}>
                  <Link href={`/blog/${article.slug}`} className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-lg">
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
                        <span className="absolute right-4 top-4 rounded-full bg-gold/90 px-3 py-1 text-xs font-medium text-white">
                          {article.category}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="mb-3 flex items-center gap-3 text-xs text-warmgray">
                        <time dateTime={article.createdAt}>
                          {new Date(article.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                        </time>
                        <span>·</span>
                        <span>{article.author}</span>
                      </div>
                      <h2 className="font-serif text-xl font-light leading-snug text-charcoal transition-colors group-hover:text-gold">
                        {article.title}
                      </h2>
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-warmgray">
                        {article.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gold">
                        اقرأ المزيد
                        <svg className="h-3 w-3 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
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
                  ? `لا توجد مقالات في تصنيف "${filterCategory}"`
                  : filterTag
                  ? `لا توجد مقالات بوسم "${filterTag}"`
                  : "لا توجد مقالات منشورة حالياً"}
              </p>
              {(filterCategory || filterTag) && (
                <Link href="/blog" className="mt-4 inline-block text-sm font-medium text-gold hover:underline">
                  عرض جميع المقالات
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
