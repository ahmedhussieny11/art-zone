import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export interface LatestArticleItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  author: string;
  createdAt: string;
}

interface LatestArticlesProps {
  articles: LatestArticleItem[];
  label?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  labelSize?: string;
  titleSize?: string;
  bodySize?: string;
  /** نص رابط «اقرأ المزيد» حسب اللغة */
  readMoreText?: string;
  /** تنسيق التاريخ (مثلاً ar-SA أو en-US) */
  dateLocale?: string;
  contentDir?: "rtl" | "ltr";
}

export default function LatestArticles({
  articles,
  label = "المدونة",
  title = "أحدث المقالات",
  description = "نصائح واتجاهات في التصميم الداخلي من فريق آرت زون.",
  ctaText = "عرض جميع المقالات",
  labelSize,
  titleSize,
  bodySize,
  readMoreText = "اقرأ المزيد",
  dateLocale = "ar-SA",
  contentDir = "rtl",
}: LatestArticlesProps) {
  const items = articles;
  if (items.length === 0) return null;

  const isRtl = contentDir === "rtl";
  const textAlign = isRtl ? "text-right" : "text-left";
  const flexEnd = isRtl ? "justify-end" : "justify-start";
  const badgeCorner = isRtl ? "right-4" : "left-4";
  const readMoreArrowHover = isRtl ? "group-hover:translate-x-1" : "group-hover:-translate-x-1";
  const ctaArrowHover = isRtl ? "group-hover:translate-x-1" : "group-hover:-translate-x-1";

  return (
    <section className="bg-offwhite py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <SectionHeading
          label={label}
          title={title}
          description={description}
          labelSize={labelSize}
          titleSize={titleSize}
          bodySize={bodySize}
        />

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((article, i) => (
            <FadeIn key={article._id} delay={i * 0.1}>
              <Link
                href={`/blog/${article.slug}`}
                className={`group block h-full overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-lg dark:bg-zinc-900/60 ${textAlign}`}
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
                  <div className={`mb-3 flex items-center gap-3 text-xs text-warmgray ${flexEnd}`}>
                    <span>{article.author}</span>
                    <span>·</span>
                    <time dateTime={article.createdAt}>
                      {new Date(article.createdAt).toLocaleDateString(dateLocale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <h3 className="font-serif text-xl font-light leading-snug text-charcoal transition-colors group-hover:text-gold">
                    {article.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-warmgray">{article.excerpt}</p>
                  <div className={`mt-4 flex items-center gap-2 text-xs font-medium text-gold ${flexEnd}`}>
                    {isRtl ? (
                      <>
                        <svg
                          className={`h-3 w-3 transition-transform ${readMoreArrowHover}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        {readMoreText}
                      </>
                    ) : (
                      <>
                        {readMoreText}
                        <svg
                          className={`h-3 w-3 transition-transform ${readMoreArrowHover}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
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

        <FadeIn delay={0.35}>
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-3 text-base font-medium tracking-widest text-charcoal transition-colors hover:text-gold"
            >
              {isRtl ? (
                <>
                  <svg
                    className={`h-4 w-4 transition-transform ${ctaArrowHover}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  {ctaText}
                </>
              ) : (
                <>
                  {ctaText}
                  <svg
                    className={`h-4 w-4 transition-transform ${ctaArrowHover}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </>
              )}
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
