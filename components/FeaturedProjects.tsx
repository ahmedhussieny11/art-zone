import Link from "next/link";
import SectionHeading from "./ui/SectionHeading";
import ProjectCard from "./ProjectCard";
import FadeIn from "./ui/FadeIn";
import { sampleProjects } from "@/lib/sample-data";

interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  coverImage?: string | null;
}

interface FeaturedProjectsProps {
  projects?: Project[];
  viewAllLabel?: string;
  label?: string;
  title?: string;
  description?: string;
  labelSize?: string;
  titleSize?: string;
  bodySize?: string;
}

export default function FeaturedProjects({
  projects,
  viewAllLabel,
  label = "أعمالنا",
  title = "مشاريع مميزة",
  description = "مجموعة مختارة من أبرز مشاريع التصميم الداخلي لدينا.",
  labelSize,
  titleSize,
  bodySize,
}: FeaturedProjectsProps) {
  const items = projects || sampleProjects.filter((p) => p.featured);

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
          {items.map((project, i) => (
            <ProjectCard
              key={project._id}
              title={project.title}
              slug={project.slug.current}
              category={project.category}
              coverImage={project.coverImage}
              index={i}
            />
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-12 text-center">
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-3 text-base font-medium tracking-widest text-charcoal transition-colors hover:text-gold"
            >
              {viewAllLabel ?? "عرض جميع المشاريع"}
              <svg
                className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
