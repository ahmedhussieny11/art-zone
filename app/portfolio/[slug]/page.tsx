import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import UploadedImage from "@/components/UploadedImage";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import FadeIn from "@/components/ui/FadeIn";
import ProjectCard from "@/components/ProjectCard";
import PortfolioImageGallery from "@/components/PortfolioImageGallery";
import { getProjects, getProjectBySlug } from "@/lib/data";
import { getSiteLocale } from "@/lib/get-site-locale";
import { getDict, t } from "@/lib/locale-dict";
import { getLocalizedProject, getLocalizedProjects } from "@/lib/localized-entities";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

function categoryLabel(dict: ReturnType<typeof getDict>, category: string): string {
  const key = `categories.${category}`;
  const tr = t(dict, key);
  return tr !== key ? tr : category;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const raw = getProjectBySlug(slug);
  if (!raw) return {};
  const locale = await getSiteLocale();
  const project = getLocalizedProject(raw, locale);
  const dict = getDict(locale);
  const cat = categoryLabel(dict, project.category);
  return {
    title: project.title,
    description: t(dict, "portfolioProject.metaDescription", {
      title: project.title,
      cat,
    }),
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const raw = getProjectBySlug(slug);
  if (!raw) notFound();

  const locale = await getSiteLocale();
  const dict = getDict(locale);
  const project = getLocalizedProject(raw, locale);

  const relatedRaw = getProjects().filter((p) => p.category === project.category && p._id !== project._id).slice(0, 3);
  const related = getLocalizedProjects(relatedRaw, locale);

  const galleryImages = (project.gallery ?? []).map((s) => String(s).trim()).filter(Boolean);
  const hasGallery = galleryImages.length > 0;
  const cat = categoryLabel(dict, project.category);

  return (
    <>
      <section className="relative bg-charcoal pb-16 pt-32 md:pt-40 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <FadeIn>
            <Link href="/portfolio" className="mb-6 inline-flex items-center gap-2 text-xs font-medium tracking-widest text-white/60 transition-colors hover:text-gold">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
              {t(dict, "portfolioProject.back")}
            </Link>
            <span className="mb-3 block text-xs font-semibold tracking-[0.2em] text-gold">{cat}</span>
            <h1 className="font-serif text-4xl font-light text-white md:text-5xl lg:text-6xl">{project.title}</h1>
          </FadeIn>
        </div>
      </section>

      <section className="bg-offwhite">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <FadeIn>
            <div className="relative -mt-8 aspect-[21/9] overflow-hidden shadow-2xl">
              {project.coverImage ? (
                <UploadedImage src={project.coverImage} alt={project.title} fill className="object-cover" sizes="100vw" priority />
              ) : (
                <PlaceholderImage className="h-full w-full" label={project.title} />
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {project.concept && (
        <section className="bg-offwhite py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-6 lg:px-12">
            <FadeIn>
              <h2 className="mb-2 text-xs font-semibold tracking-[0.2em] text-gold">{t(dict, "portfolioProject.concept")}</h2>
              <p className="font-serif text-xl leading-relaxed text-charcoal md:text-2xl">{project.concept}</p>
            </FadeIn>
          </div>
        </section>
      )}

      {(project.beforeImage || project.afterImage) && (
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-12">
            <FadeIn>
              <h2 className="mb-8 text-center text-xs font-semibold tracking-[0.2em] text-gold">{t(dict, "portfolioProject.beforeAfter")}</h2>
              <BeforeAfterSlider beforeImage={project.beforeImage} afterImage={project.afterImage} />
            </FadeIn>
          </div>
        </section>
      )}

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <FadeIn><h2 className="mb-8 text-center text-xs font-semibold tracking-[0.2em] text-gold">{t(dict, "portfolioProject.gallery")}</h2></FadeIn>
          {hasGallery ? (
            <PortfolioImageGallery images={galleryImages} title={project.title} />
          ) : (
            <FadeIn>
              <p className="text-center text-sm text-warmgray">{t(dict, "portfolioProject.galleryEmpty")}</p>
            </FadeIn>
          )}
        </div>
      </section>

      {project.materials && project.materials.length > 0 && (
        <section className="bg-offwhite py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-6 text-center lg:px-12">
            <FadeIn>
              <h2 className="mb-8 text-xs font-semibold tracking-[0.2em] text-gold">{t(dict, "portfolioProject.materials")}</h2>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {project.materials.map((m) => (<span key={m} className="border border-warmgray/30 px-5 py-2 text-sm text-charcoal">{m}</span>))}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <FadeIn><h2 className="mb-12 text-center text-xs font-semibold tracking-[0.2em] text-gold">{t(dict, "portfolioProject.related")}</h2></FadeIn>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProjectCard key={p._id} title={p.title} slug={p.slug} category={p.category} coverImage={p.coverImage} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
