"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionHeading from "./ui/SectionHeading";
import FadeIn from "./ui/FadeIn";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className="font-serif text-5xl font-light text-gold lg:text-6xl">
      {isInView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {value}
          {suffix}
        </motion.span>
      ) : (
        "0"
      )}
    </span>
  );
}

const stats = [
  { value: 150, suffix: "+", label: "مشروع مكتمل" },
  { value: 12, suffix: "+", label: "سنوات خبرة" },
  { value: 98, suffix: "%", label: "رضا العملاء" },
];

interface AboutSectionProps {
  label?: string;
  title?: string;
  description?: string;
  labelSize?: string;
  titleSize?: string;
  bodySize?: string;
}

export default function AboutSection({
  label = "من نحن",
  title = "نُعرّف الفخامة من خلال التصميم",
  description = "في آرت زون للتصميم، نؤمن بأن المساحات الاستثنائية تروي قصة. فريقنا من المصممين المبدعين والحرفيين المهرة يعملون معاً لابتكار بيئات مذهلة وعملية في آنٍ واحد. بخبرة تزيد عن عقد من الزمن في التصميم الداخلي الفاخر، اكتسبنا ثقة العملاء المميزين في المنطقة.",
  labelSize,
  titleSize,
  bodySize,
}: AboutSectionProps) {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <SectionHeading
          label={label}
          title={title}
          labelSize={labelSize}
          titleSize={titleSize}
          bodySize={bodySize}
        />
        <FadeIn delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-warmgray md:text-xl">
            {description}
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <Counter value={stat.value} suffix={stat.suffix} />
                <p className="mt-3 text-sm font-medium tracking-widest text-warmgray">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
