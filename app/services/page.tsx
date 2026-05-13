import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import CTABanner from "@/components/CTABanner";
import { getServices, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "خدماتنا",
  description:
    "آرت زون للتصميم تقدم خدمات التصميم الداخلي الفاخر والتشطيبات الاحترافية والإشراف المتخصص للمساحات السكنية والتجارية.",
};

function ServiceIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    interior: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 22h20M3 22V6l9-4 9 4v16M9 22v-6h6v6M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
      </svg>
    ),
    fitout: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.59-5.59a2 2 0 010-2.83l.83-.83a2 2 0 012.83 0l5.59 5.59M18 13l-1.5-7.5L9 4l1.5 7.5M14.5 17a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 22h6" />
      </svg>
    ),
    supervision: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  };

  return (
    <div className="flex h-16 w-16 items-center justify-center border border-gold/30 text-gold">
      {icons[icon] || icons.interior}
    </div>
  );
}

export default function ServicesPage() {
  const services = getServices();
  const settings = getSettings();

  const heroLabel = settings.servicesPageLabel || "ماذا نقدم";
  const heroTitle = settings.servicesPageTitle || "خدماتنا";
  const heroDesc = settings.servicesPageDescription || "من الفكرة الأولى إلى التنفيذ النهائي، نقدم حلول تصميم شاملة مصممة خصيصاً لرؤيتك الفريدة.";
  const buttonText = settings.servicesPageButtonText || "اطلب الخدمة";
  const processLabel = settings.processLabel || "كيف نعمل";
  const processTitle = settings.processTitle || "مراحل العمل";
  const processDesc = settings.processDescription || "رحلة سلسة من فكرتك الأولى إلى مساحة متكاملة.";
  const steps = settings.processSteps?.length ? settings.processSteps : [
    { step: "٠١", title: "الاستشارة", description: "نبدأ باستشارة معمّقة لفهم رؤيتك وأسلوب حياتك ومتطلباتك." },
    { step: "٠٢", title: "تطوير المفهوم", description: "يبتكر مصممونا مفهوماً شاملاً يتضمن لوحات الإلهام والتخطيطات واختيار المواد." },
    { step: "٠٣", title: "التصميم والتفاصيل", description: "يتم صقل كل عنصر بالرسومات الفنية والتصورات ثلاثية الأبعاد والمواصفات التفصيلية." },
    { step: "٠٤", title: "التنفيذ", description: "فريقنا يدير عملية البناء بالكامل، لضمان تنفيذ التصميم بأعلى المعايير." },
  ];

  const sc = settings.servicesColors || { heroBg: "#2C2C2C", heroText: "#FFFFFF", cardBg: "#FFFFFF", cardText: "#2C2C2C", processBg: "#FFFFFF" };

  return (
    <>
      <section className="pb-16 pt-32 md:pt-40" style={{ backgroundColor: sc.heroBg }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeading label={heroLabel} title={heroTitle} description={heroDesc} className="[&_h2]:!text-[--svc-hero-text] [&_p]:!text-[--svc-hero-text]/60 [&_span]:!text-[--svc-hero-text]/70" style={{ "--svc-hero-text": sc.heroText } as React.CSSProperties} />
        </div>
      </section>

      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-8 md:grid-cols-3">
            {services.map((service, i) => (
              <FadeIn key={service._id} delay={i * 0.15}>
                <div className="group p-10 transition-shadow hover:shadow-xl" style={{ backgroundColor: sc.cardBg, color: sc.cardText }}>
                  <ServiceIcon icon={service.icon} />
                  <h3 className="mt-6 font-serif text-2xl font-light" style={{ color: sc.cardText }}>{service.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-warmgray">{service.description}</p>
                  <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-xs font-medium tracking-widest text-gold transition-all group-hover:gap-3">
                    {buttonText}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24" style={{ backgroundColor: sc.processBg }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeading label={processLabel} title={processTitle} description={processDesc} />
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className="relative">
                  <span className="font-serif text-5xl font-light text-gold/20">{step.step}</span>
                  <h3 className="mt-2 font-serif text-xl font-light text-charcoal">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-warmgray">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
