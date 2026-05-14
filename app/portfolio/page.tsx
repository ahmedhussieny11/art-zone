import { Suspense } from "react";
import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import PortfolioFilter from "@/components/PortfolioFilter";
import ProjectCard from "@/components/ProjectCard";
import { getProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "أعمالنا",
  description: "استكشف معرض أعمالنا في التصميم الداخلي الفاخر الذي يشمل الأنماط السكنية والتجارية والكلاسيكية والعصرية.",
};

interface PortfolioPageProps {
  searchParams: Promise<{ cat?: string }>;
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const { cat } = await searchParams;
  const allProjects = getProjects();
  const filtered = cat ? allProjects.filter((p) => p.category === cat) : allProjects;

  return (
    <>
      <section className="bg-charcoal pb-16 pt-32 md:pt-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeading label="أعمالنا" title="معرض المشاريع" description="كل مشروع هو قصة فريدة من الإبداع والحرفية والتعاون." className="[&_h2]:text-white [&_p]:text-white/60" />
        </div>
      </section>

      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <Suspense><PortfolioFilter /></Suspense>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <ProjectCard key={project._id} title={project.title} slug={project.slug} category={project.category} coverImage={project.coverImage} index={i} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="py-20 text-center"><p className="font-serif text-xl text-warmgray">لا توجد مشاريع في هذه الفئة.</p></div>
          )}
        </div>
      </section>
    </>
  );
}
