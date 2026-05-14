import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";
import ArticleCoverLightbox from "@/components/ArticleCoverLightbox";
import FadeIn from "@/components/ui/FadeIn";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { getPublishedArticles, getArticleBySlug, getPublicSiteUrl, getSettings } from "@/lib/data";
import { absoluteMediaUrl } from "@/lib/media-url";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const siteUrl = getPublicSiteUrl();

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    keywords: article.seoKeywords,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      type: "article",
      locale: "ar_SA",
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      tags: article.tags,
      images: (() => {
        const u = absoluteMediaUrl(siteUrl, article.ogImage || article.coverImage);
        return u ? [{ url: u, width: 1200, height: 630, alt: article.title }] : [];
      })(),
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      images: (() => {
        const u = absoluteMediaUrl(siteUrl, article.ogImage || article.coverImage);
        return u ? [u] : [];
      })(),
    },
    alternates: {
      canonical: `${siteUrl}/blog/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article || !article.published) notFound();

  const related = getPublishedArticles()
    .filter((a) => a._id !== article._id && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))))
    .slice(0, 3);

  const siteUrl = getPublicSiteUrl();
  const siteName = getSettings().siteName;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seoDescription || article.excerpt,
    image: absoluteMediaUrl(siteUrl, article.coverImage),
    author: { "@type": "Organization", name: article.author },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${article.slug}` },
    keywords: article.seoKeywords?.join(", "),
    articleSection: article.category,
    inLanguage: "ar",
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "الرئيسية", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "المدونة", item: `${siteUrl}/blog` },
      { "@type": "ListItem", position: 3, name: article.title, item: `${siteUrl}/blog/${article.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Hero */}
      <section className="bg-charcoal pb-16 pt-32 md:pt-40">
        <div className="mx-auto max-w-4xl px-6 lg:px-12">
          <FadeIn>
            <nav className="mb-6 flex items-center gap-2 text-xs text-white/40">
              <Link href="/" className="hover:text-gold">الرئيسية</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-gold">المدونة</Link>
              <span>/</span>
              <span className="text-white/60">{article.title}</span>
            </nav>

            {article.category && (
              <Link href={`/blog?category=${encodeURIComponent(article.category)}`} className="mb-3 inline-block rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold transition-colors hover:bg-gold/30">
                {article.category}
              </Link>
            )}

            <h1 className="font-serif text-3xl font-light leading-tight text-white md:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/50">
              <span>{article.author}</span>
              <span>·</span>
              <time dateTime={article.createdAt}>
                {new Date(article.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              {article.tags.length > 0 && (
                <>
                  <span>·</span>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="rounded border border-white/10 px-2 py-0.5 text-xs text-white/40 transition-colors hover:border-gold/40 hover:text-gold">{tag}</Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Cover Image */}
      {article.coverImage && (
        <section className="bg-offwhite">
          <div className="mx-auto max-w-5xl px-6 lg:px-12">
            <FadeIn>
              <ArticleCoverLightbox src={article.coverImage} alt={article.title} />
            </FadeIn>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-12">
          <FadeIn>
            <article
              className="prose prose-lg max-w-none text-charcoal prose-headings:font-serif prose-headings:font-light prose-headings:text-charcoal prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-p:text-warmgray prose-a:text-gold prose-a:no-underline hover:prose-a:underline prose-strong:text-charcoal prose-blockquote:border-gold prose-blockquote:text-warmgray prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </FadeIn>
        </div>
      </section>

      {/* Share */}
      <section className="border-t border-warmgray/10 bg-offwhite py-8">
        <div className="mx-auto max-w-3xl px-6 lg:px-12">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-charcoal">شارك المقال:</span>
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${siteUrl}/blog/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-warmgray/20 text-warmgray transition-colors hover:border-gold hover:text-gold"
                aria-label="مشاركة على تويتر"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${siteUrl}/blog/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-warmgray/20 text-warmgray transition-colors hover:border-gold hover:text-gold"
                aria-label="مشاركة على فيسبوك"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${siteUrl}/blog/${article.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-warmgray/20 text-warmgray transition-colors hover:border-gold hover:text-gold"
                aria-label="مشاركة عبر واتساب"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <FadeIn>
              <h2 className="mb-10 text-center text-xs font-semibold tracking-[0.2em] text-gold">مقالات ذات صلة</h2>
            </FadeIn>
            <div className="grid gap-8 md:grid-cols-3">
              {related.map((a, i) => (
                <FadeIn key={a._id} delay={i * 0.1}>
                  <Link href={`/blog/${a.slug}`} className="group block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                      {a.coverImage ? (
                        <UploadedImage src={a.coverImage} alt={a.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="33vw" />
                      ) : (
                        <PlaceholderImage className="h-full w-full" />
                      )}
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-light text-charcoal transition-colors group-hover:text-gold">
                      {a.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-warmgray">{a.excerpt}</p>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
