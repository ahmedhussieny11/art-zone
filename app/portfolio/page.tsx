import { Suspense } from "react";
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import PortfolioFilter from "@/components/PortfolioFilter";
import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/data";
import { getSiteLocale } from "@/lib/get-site-locale";
import { getDict, t } from "@/lib/locale-dict";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const dict = getDict(locale);
  return {
    title: t(dict, "portfolio.metaTitle"),
    description: t(dict, "portfolio.metaDescription"),
  };
}

interface PortfolioPageProps {
  searchParams: Promise<{ cat?: string }>;
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const { cat } = await searchParams;
  const dict = getDict(await getSiteLocale());
  const allProjects = getProjects();
  const filtered = cat ? allProjects.filter((p) => p.category === cat) : allProjects;

  return (
    <>
      <section className="bg-charcoal pb-16 pt-32 md:pt-40 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeading
            label={t(dict, "portfolio.label")}
            title={t(dict, "portfolio.title")}
            description={t(dict, "portfolio.description")}
            className="[&_h2]:text-white [&_p]:text-white/60"
          />
        </div>
      </section>

      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <Suspense>
            <PortfolioFilter />
          </Suspense>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project._id}
                title={project.title}
                slug={project.slug}
                category={project.category}
                coverImage={project.coverImage}
                index={i}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-serif text-xl text-warmgray">{t(dict, "portfolio.emptyCategory")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
