"use client";

import { motion, useInView } from "framer-motion";
import { Compass, Palette, Ruler, Armchair, Sparkles, PenLine, Eye, Layers, Home, Star, Wrench, type LucideIcon } from "lucide-react";
import { useRef } from "react";

const ICON_MAP: Record<string, LucideIcon> = {
  compass: Compass,
  palette: Palette,
  ruler: Ruler,
  armchair: Armchair,
  sparkles: Sparkles,
  pen: PenLine,
  eye: Eye,
  layers: Layers,
  home: Home,
  star: Star,
  wrench: Wrench,
};

interface BentoFeature {
  title: string;
  description: string;
  icon: string;
}

interface BentoStat {
  value: string;
  label: string;
}

function Counter({ value }: { value: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <span ref={ref}>
      {isInView ? (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {value}
        </motion.span>
      ) : (
        <span className="opacity-0">0</span>
      )}
    </span>
  );
}

function Reveal({ delay = 0, children, className = "" }: {
  delay?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface BentoGridProps {
  label?: string;
  title?: string;
  description?: string;
  badgeText?: string;
  features?: BentoFeature[];
  stats?: BentoStat[];
  labelSize?: string;
  titleSize?: string;
  bodySize?: string;
}

const DEFAULT_FEATURES: BentoFeature[] = [
  { title: "استشارات التصميم", description: "نبدأ معك من الفكرة الأولى ونرسم خارطة طريق واضحة لمشروعك.", icon: "compass" },
  { title: "التصميم الداخلي", description: "تصاميم ثلاثية الأبعاد تجمع بين الجمال والوظيفة بدقة متناهية.", icon: "palette" },
  { title: "الإشراف والتنفيذ", description: "متابعة يومية لكل تفصيلة لضمان مطابقة النتائج لرؤيتك.", icon: "ruler" },
  { title: "تأثيث وتنسيق", description: "اختيار الأثاث والإكسسوارات التي تكمل هوية المكان بتناغم.", icon: "armchair" },
];

const DEFAULT_STATS: BentoStat[] = [
  { value: "150+", label: "مشروع مكتمل" },
  { value: "12+", label: "سنوات خبرة" },
  { value: "98%", label: "رضا العملاء" },
];

export default function BentoGrid({
  label = "من نحن",
  title = "نُعرّف الفخامة من خلال التصميم",
  description = "في آرت زون للتصميم، نؤمن بأن المساحات الاستثنائية تروي قصة. فريقنا من المصممين المبدعين والحرفيين المهرة يعملون معاً لابتكار بيئات مذهلة وعملية في آنٍ واحد.",
  badgeText = "بخبرة تزيد عن عقد من الزمن",
  features = DEFAULT_FEATURES,
  stats = DEFAULT_STATS,
}: BentoGridProps) {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-4 md:grid-cols-3 lg:gap-5">

          {/* Hero card — 2 cols */}
          <Reveal delay={0} className="md:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-3xl border border-gold/10 bg-gradient-to-br from-charcoal to-charcoal/90 p-8 md:p-10 lg:p-12">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-gold/5 blur-2xl" />
              <div className="relative z-10">
                <span className="mb-4 inline-block rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 text-xs font-semibold tracking-[0.15em] text-gold">
                  {label}
                </span>
                <h2 className="mt-2 font-serif text-3xl font-light leading-tight text-white md:text-4xl lg:text-5xl">
                  {title}
                </h2>
                <p className="mt-5 max-w-lg text-base leading-relaxed text-white/45 md:text-lg">
                  {description}
                </p>
                <div className="mt-8 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span className="text-sm font-medium tracking-wide text-gold/80">{badgeText}</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Feature cards */}
          {features.slice(0, 4).map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] ?? Compass;
            return (
              <Reveal key={i} delay={(i + 1) * 0.12}>
                <div className="group h-full rounded-3xl border border-warmgray/10 bg-offwhite/50 p-7 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-gold/25 hover:shadow-lg hover:shadow-gold/5 lg:p-8">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-white">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-lg font-light text-charcoal">{feature.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-warmgray">{feature.description}</p>
                </div>
              </Reveal>
            );
          })}

          {/* Stats card — 2 cols */}
          <Reveal delay={0.6} className="md:col-span-2">
            <div className="flex items-center justify-around rounded-3xl border border-gold/15 bg-gradient-to-r from-gold/5 to-gold/10 p-7 lg:p-8">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center">
                  <div className="text-center">
                    <span className="font-serif text-3xl font-light text-gold md:text-4xl">
                      <Counter value={stat.value} />
                    </span>
                    <p className="mt-1 text-xs font-medium tracking-widest text-warmgray">{stat.label}</p>
                  </div>
                  {i < stats.length - 1 && (
                    <div className="mx-6 h-10 w-px bg-gold/15 md:mx-8" />
                  )}
                </div>
              ))}
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
