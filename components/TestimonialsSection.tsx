"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeading from "./ui/SectionHeading";
import { useSiteLocale } from "@/components/SiteProviders";
import { sampleTestimonials } from "@/lib/sample-data";

interface Testimonial {
  _id: string;
  clientName: string;
  quote: string;
  avatar: unknown;
  project?: { title: string; slug: { current: string } };
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  label?: string;
  title?: string;
  labelSize?: string;
  titleSize?: string;
}

export default function TestimonialsSection({
  testimonials,
  label = "آراء العملاء",
  title = "ماذا يقول عملاؤنا",
  labelSize,
  titleSize,
}: TestimonialsSectionProps) {
  const { t } = useSiteLocale();
  const items = testimonials || sampleTestimonials;
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % items.length);
  const prev = () =>
    setCurrent((prev) => (prev - 1 + items.length) % items.length);

  return (
    <section className="bg-charcoal py-24 md:py-32 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-12">
        <SectionHeading
          label={label}
          title={title}
          labelSize={labelSize}
          titleSize={titleSize}
          className="[&_h2]:text-white [&_p]:text-white/60"
        />

        <div className="relative mt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <svg
                className="mx-auto mb-8 h-10 w-10 text-gold/30"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
              </svg>

              <blockquote className="font-serif text-2xl font-light leading-relaxed text-white/85 md:text-3xl lg:text-4xl">
                &ldquo;{items[current].quote}&rdquo;
              </blockquote>

              <div className="mt-10">
                <p className="text-lg font-semibold tracking-widest text-gold">
                  {items[current].clientName}
                </p>
                {items[current].project && (
                  <p className="mt-2 text-base text-white/40">
                    {items[current].project!.title}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-center gap-6">
            <button
              onClick={next}
              className="flex h-11 w-11 items-center justify-center border border-white/15 text-white/60 transition-all hover:border-gold hover:text-gold"
              aria-label={t("testimonials.next")}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current
                      ? "w-10 bg-gold"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={t("testimonials.goTo", { n: String(i + 1) })}
                />
              ))}
            </div>

            <button
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center border border-white/15 text-white/60 transition-all hover:border-gold hover:text-gold"
              aria-label={t("testimonials.prev")}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
