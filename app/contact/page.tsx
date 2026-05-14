import type { Metadata } from "next";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import ContactForm from "@/components/ContactForm";
import { getSettings } from "@/lib/data";
import { getLocalizedSettings } from "@/lib/localized-settings";
import { getSiteLocale } from "@/lib/get-site-locale";
import { getDict, t } from "@/lib/locale-dict";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getSiteLocale();
  const dict = getDict(locale);
  return {
    title: t(dict, "contact.metaTitle"),
    description: t(dict, "contact.metaDescription"),
  };
}

export default async function ContactPage() {
  const locale = await getSiteLocale();
  const dict = getDict(locale);
  const s = getLocalizedSettings(getSettings(), locale);
  const phone = (s.whatsappNumber || "+201012345678").replace(/\+/g, "");
  const waMessage = s.whatsappMessage || "";
  const waUrl = waMessage
    ? `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`
    : `https://wa.me/${phone}`;

  return (
    <>
      <section className="bg-charcoal pb-16 pt-32 md:pt-40 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <SectionHeading
            label={t(dict, "contact.sectionLabel")}
            title={s.contactPageTitle || t(dict, "contact.pageTitleDefault")}
            description={
              s.contactPageSubtitle ||
              t(dict, "contact.pageSubtitleDefault")
            }
            className="[&_h2]:text-white [&_p]:text-white/60"
          />
        </div>
      </section>

      <section className="bg-offwhite py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-5">
            <FadeIn className="lg:col-span-3">
              <div className="bg-white p-8 md:p-12 dark:bg-zinc-900/50">
                <h3 className="mb-2 font-serif text-2xl font-light text-charcoal">
                  {s.contactFormTitle || t(dict, "contactForm.requestConsultation")}
                </h3>
                <p className="mb-8 text-sm text-warmgray">
                  {s.contactFormSubtitle || t(dict, "contactForm.requestSubtitle")}
                </p>
                <ContactForm
                  phonePlaceholder={s.contactPhonePlaceholder}
                  serviceOptions={s.contactServiceOptions}
                  budgetRanges={s.contactBudgetRanges}
                />
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="lg:col-span-2">
              <div className="space-y-10">
                <div>
                  <h4 className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold">{s.contactWhatsappTitle}</h4>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-lg text-charcoal transition-colors hover:text-gold"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {s.contactWhatsappCta}
                  </a>
                  <p className="mt-1 text-sm text-warmgray">{s.contactWhatsappHint}</p>
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold">{s.contactEmailTitle}</h4>
                  <a href={`mailto:${s.email}`} className="text-lg text-charcoal transition-colors hover:text-gold">
                    {s.email}
                  </a>
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold">{s.contactStudioTitle}</h4>
                  <p className="text-charcoal">{s.address}</p>
                  {s.addressNote && <p className="mt-1 text-sm text-warmgray">{s.addressNote}</p>}
                </div>

                <div>
                  <h4 className="mb-3 text-xs font-semibold tracking-[0.2em] text-gold">{s.contactHoursTitle}</h4>
                  <div className="space-y-1 text-sm text-charcoal">
                    <p>{s.workingHours}</p>
                    <p>{s.closedDays}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {s.googleMapsEnabled !== false && (
        <section className="bg-white dark:bg-zinc-950">
          <div className="aspect-[21/9] w-full bg-warmgray/10 dark:bg-zinc-900/40">
            {s.googleMapsUrl ? (
              <iframe
                src={s.googleMapsUrl}
                className="h-full w-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t(dict, "contact.mapTitle")}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-warmgray/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mt-3 text-sm text-warmgray">{t(dict, "contact.mapMissing")}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
