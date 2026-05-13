"use client";

import { useState, useEffect } from "react";
import type { SiteSettings } from "@/lib/data";
import { GalleryUploader } from "@/components/admin/ImageUploader";

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "انستغرام", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { key: "facebook", label: "فيسبوك", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { key: "twitter", label: "X (تويتر)", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { key: "tiktok", label: "تيك توك", icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
  { key: "youtube", label: "يوتيوب", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { key: "snapchat", label: "سناب شات", icon: "M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.217-.937 1.407-5.965 1.407-5.965s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" },
  { key: "linkedin", label: "لينكد إن", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
] as const;

type SocialKey = typeof SOCIAL_PLATFORMS[number]["key"];

export default function SectionsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [heroKeywordsEnabled, setHeroKeywordsEnabled] = useState(true);
  const [heroKeywords, setHeroKeywords] = useState<string[]>(["تصميم داخلي", "فاخر", "إبداعي"]);

  const [bentoFeatures, setBentoFeatures] = useState<{ title: string; description: string; icon: string }[]>([
    { title: "", description: "", icon: "compass" },
  ]);
  const [bentoStats, setBentoStats] = useState<{ value: string; label: string }[]>([
    { value: "", label: "" },
  ]);

  const [socialEnabled, setSocialEnabled] = useState(true);
  const [socialClickAction, setSocialClickAction] = useState<"lightbox" | "link">("lightbox");
  const [socialCustomLink, setSocialCustomLink] = useState("");
  const [socialImages, setSocialImages] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<SocialKey, string>>({
    instagram: "", facebook: "", twitter: "", tiktok: "", youtube: "", snapchat: "", linkedin: "",
  });
  const [socialShow, setSocialShow] = useState<Record<SocialKey, boolean>>({
    instagram: true, facebook: false, twitter: false, tiktok: false, youtube: false, snapchat: false, linkedin: false,
  });

  const [homeBlogEnabled, setHomeBlogEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s: SiteSettings) => {
        setSettings(s);
        setHeroKeywordsEnabled(s.heroKeywordsEnabled !== false);
        if (s.heroKeywords?.length) setHeroKeywords(s.heroKeywords);
        if (s.bentoFeatures?.length) setBentoFeatures(s.bentoFeatures);
        if (s.bentoStats?.length) setBentoStats(s.bentoStats);
        setSocialEnabled(s.socialSectionEnabled !== false);
        setSocialClickAction(s.socialSectionClickAction || "lightbox");
        setSocialCustomLink(s.socialSectionCustomLink || "");
        setSocialImages(s.socialSectionImages || []);
        if (s.socialLinks) {
          setSocialLinks(prev => ({ ...prev, ...s.socialLinks }));
        }
        if (s.socialLinksShow) {
          setSocialShow(prev => ({ ...prev, ...s.socialLinksShow }));
        }
        setHomeBlogEnabled(s.homeBlogEnabled !== false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      ...settings,
      heroLabel: fd.get("heroLabel"),
      heroTitle: fd.get("heroTitle"),
      heroSubtitle: fd.get("heroSubtitle"),
      heroCta1Text: fd.get("heroCta1Text"),
      heroCta1Link: fd.get("heroCta1Link"),
      heroCta2Text: fd.get("heroCta2Text"),
      heroCta2Link: fd.get("heroCta2Link"),
      heroKeywordsEnabled,
      heroKeywords,
      aboutLabel: fd.get("aboutLabel"),
      aboutTitle: fd.get("aboutTitle"),
      aboutDescription: fd.get("aboutDescription"),
      bentoBadgeText: fd.get("bentoBadgeText"),
      bentoFeatures,
      bentoStats,
      projectsLabel: fd.get("projectsLabel"),
      projectsTitle: fd.get("projectsTitle"),
      projectsDescription: fd.get("projectsDescription"),
      testimonialsLabel: fd.get("testimonialsLabel"),
      testimonialsTitle: fd.get("testimonialsTitle"),
      ctaBannerTitle: fd.get("ctaBannerTitle"),
      ctaBannerDescription: fd.get("ctaBannerDescription"),
      ctaBannerButtonText: fd.get("ctaBannerButtonText"),
      socialSectionEnabled: socialEnabled,
      socialSectionClickAction: socialClickAction,
      socialSectionCustomLink: socialCustomLink,
      socialSectionLabel: fd.get("socialSectionLabel"),
      socialSectionTitle: fd.get("socialSectionTitle"),
      socialSectionDescription: fd.get("socialSectionDescription"),
      socialSectionImages: socialImages,
      socialSectionButtonText: fd.get("socialSectionButtonText"),
      socialLinks,
      socialLinksShow: socialShow,
      homeBlogEnabled,
      homeBlogLabel: fd.get("homeBlogLabel"),
      homeBlogTitle: fd.get("homeBlogTitle"),
      homeBlogDescription: fd.get("homeBlogDescription"),
      homeBlogLimit: Math.min(6, Math.max(1, Number(fd.get("homeBlogLimit")) || 3)),
      homeBlogCtaText: fd.get("homeBlogCtaText"),
    };
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!settings) return <div className="text-warmgray">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">أقسام الصفحة الرئيسية</h1>
      <p className="mt-1 text-sm text-warmgray">تحكم في محتوى كل قسم في الصفحة الرئيسية</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-8">

        {/* Hero Section */}
        <Section icon={<IconStar />} title="القسم الرئيسي (Hero)" color="bg-rose-50 text-rose-600">
          <Field label="الليبل الصغير" name="heroLabel" defaultValue={settings.heroLabel} />
          <Field label="العنوان الرئيسي" name="heroTitle" defaultValue={settings.heroTitle} />
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">الوصف</label>
            <textarea name="heroSubtitle" rows={2} defaultValue={settings.heroSubtitle} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="نص الزرار الأول" name="heroCta1Text" defaultValue={settings.heroCta1Text} />
            <Field label="رابط الزرار الأول" name="heroCta1Link" defaultValue={settings.heroCta1Link} dir="ltr" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="نص الزرار الثاني" name="heroCta2Text" defaultValue={settings.heroCta2Text} />
            <Field label="رابط الزرار الثاني" name="heroCta2Link" defaultValue={settings.heroCta2Link} dir="ltr" />
          </div>

          {/* Keywords band */}
          <div className="border-t border-gray-100 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-charcoal">شريط الكلمات الثابتة</p>
                <p className="text-xs text-warmgray">السطر الذي يظهر أسفل الهيرو</p>
              </div>
              <button
                type="button"
                onClick={() => setHeroKeywordsEnabled(!heroKeywordsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${heroKeywordsEnabled ? "bg-gold" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${heroKeywordsEnabled ? "translate-x-1" : "translate-x-6"}`} />
              </button>
            </div>

            {heroKeywordsEnabled && (
              <div className="space-y-2">
                {heroKeywords.map((kw, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={kw}
                      onChange={e => setHeroKeywords(prev => prev.map((x, idx) => idx === i ? e.target.value : x))}
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
                      placeholder="كلمة..."
                    />
                    <button
                      type="button"
                      onClick={() => setHeroKeywords(prev => prev.filter((_, idx) => idx !== i))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setHeroKeywords(prev => [...prev, ""])}
                  className="rounded-lg border border-gold/40 px-4 py-1.5 text-xs font-medium text-gold hover:bg-gold/10"
                >
                  + أضف كلمة
                </button>
              </div>
            )}
          </div>
        </Section>

        {/* About Section */}
        <Section icon={<IconUsers />} title="قسم من نحن" color="bg-teal-50 text-teal-600">
          <Field label="الليبل" name="aboutLabel" defaultValue={settings.aboutLabel} hint='النص الصغير اللي فوق العنوان (مثال: "من نحن")' />
          <Field label="العنوان" name="aboutTitle" defaultValue={settings.aboutTitle} />
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">الوصف</label>
            <textarea name="aboutDescription" rows={4} defaultValue={settings.aboutDescription} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
          </div>
        </Section>

        {/* Bento Grid Features */}
        <Section icon={<IconBento />} title="قسم من نحن — الكروت والإحصائيات" color="bg-teal-50 text-teal-700">
          <Field label="نص الشارة الذهبية" name="bentoBadgeText" defaultValue={settings.bentoBadgeText || "بخبرة تزيد عن عقد من الزمن"} hint='النص الصغير أسفل وصف القسم مع الأيقونة الذهبية' />

          {/* Features */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-bold text-charcoal">الكروت (خدمات / مميزات)</label>
              <button
                type="button"
                onClick={() => setBentoFeatures(prev => [...prev, { title: "", description: "", icon: "compass" }])}
                className="rounded-lg border border-gold/40 px-3 py-1 text-xs font-medium text-gold hover:bg-gold/10"
              >
                + أضف كارت
              </button>
            </div>
            <div className="space-y-3">
              {bentoFeatures.map((f, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-warmgray">كارت {i + 1}</span>
                    {bentoFeatures.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBentoFeatures(prev => prev.filter((_, idx) => idx !== i))}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-warmgray">العنوان</label>
                      <input
                        type="text"
                        value={f.title}
                        onChange={e => setBentoFeatures(prev => prev.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
                        placeholder="مثال: استشارات التصميم"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-warmgray">الأيقونة</label>
                      <select
                        value={f.icon}
                        onChange={e => setBentoFeatures(prev => prev.map((x, idx) => idx === i ? { ...x, icon: e.target.value } : x))}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
                      >
                        <option value="compass">بوصلة</option>
                        <option value="palette">لوحة ألوان</option>
                        <option value="ruler">مسطرة</option>
                        <option value="armchair">كرسي</option>
                        <option value="sparkles">تألق</option>
                        <option value="pen">قلم</option>
                        <option value="eye">عين</option>
                        <option value="layers">طبقات</option>
                        <option value="home">منزل</option>
                        <option value="star">نجمة</option>
                        <option value="wrench">مفتاح</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs text-warmgray">الوصف</label>
                    <textarea
                      rows={2}
                      value={f.description}
                      onChange={e => setBentoFeatures(prev => prev.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
                      placeholder="وصف قصير للخدمة..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-bold text-charcoal">الإحصائيات</label>
              <button
                type="button"
                onClick={() => setBentoStats(prev => [...prev, { value: "", label: "" }])}
                className="rounded-lg border border-gold/40 px-3 py-1 text-xs font-medium text-gold hover:bg-gold/10"
              >
                + أضف
              </button>
            </div>
            <div className="space-y-2">
              {bentoStats.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={s.value}
                    onChange={e => setBentoStats(prev => prev.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-bold outline-none focus:border-gold"
                    placeholder="150+"
                  />
                  <input
                    type="text"
                    value={s.label}
                    onChange={e => setBentoStats(prev => prev.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
                    placeholder="مشروع مكتمل"
                  />
                  {bentoStats.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setBentoStats(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Projects Section */}
        <Section icon={<IconGrid />} title="قسم أعمالنا" color="bg-orange-50 text-orange-600">
          <Field label="الليبل" name="projectsLabel" defaultValue={settings.projectsLabel} hint='النص الصغير اللي فوق العنوان (مثال: "أعمالنا")' />
          <Field label="العنوان" name="projectsTitle" defaultValue={settings.projectsTitle} />
          <Field label="الوصف" name="projectsDescription" defaultValue={settings.projectsDescription} />
        </Section>

        {/* Testimonials Section */}
        <Section icon={<IconQuote />} title="قسم آراء العملاء" color="bg-cyan-50 text-cyan-600">
          <Field label="الليبل" name="testimonialsLabel" defaultValue={settings.testimonialsLabel} hint='النص الصغير اللي فوق العنوان (مثال: "آراء العملاء")' />
          <Field label="العنوان" name="testimonialsTitle" defaultValue={settings.testimonialsTitle} />
        </Section>

        {/* Home blog / latest articles */}
        <Section icon={<IconBook />} title="قسم المدونة في الصفحة الرئيسية" color="bg-emerald-50 text-emerald-700">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-charcoal">إظهار القسم</span>
              <p className="text-xs text-warmgray">نصوص القسم والحد الأقصى للمقالات المعروضة</p>
            </div>
            <button
              type="button"
              onClick={() => setHomeBlogEnabled(!homeBlogEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${homeBlogEnabled ? "bg-gold" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${homeBlogEnabled ? "translate-x-1" : "translate-x-6"}`} />
            </button>
          </div>

          {homeBlogEnabled && (
            <>
              <Field label="الليبل الصغير" name="homeBlogLabel" defaultValue={settings.homeBlogLabel} />
              <Field label="عنوان القسم" name="homeBlogTitle" defaultValue={settings.homeBlogTitle} />
              <div>
                <label className="mb-2 block text-xs font-medium text-charcoal">وصف القسم</label>
                <textarea
                  name="homeBlogDescription"
                  rows={2}
                  defaultValue={settings.homeBlogDescription}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
                />
              </div>
              <Field label="نص زر عرض المزيد" name="homeBlogCtaText" defaultValue={settings.homeBlogCtaText} />
              <Field
                label="أقصى عدد مقالات في القسم"
                name="homeBlogLimit"
                type="number"
                defaultValue={String(settings.homeBlogLimit ?? 3)}
                hint="من 1 إلى 6 — المقالات التي تفعّل لها «عرض في الصفحة الرئيسية» من داخل المقال تظهر أولاً (حسب آخر تحديث). إن لم يُفعّل أي مقال، يُعرض آخر المقالات المنشورة تلقائياً."
              />
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-xs text-emerald-900">
                <strong>اختيار المقالات:</strong> من «المقالات» → افتح المقال أو أنشئ مقالاً جديداً، وفعّل خيار{' '}
                <strong>عرض في الصفحة الرئيسية</strong> بجانب النشر. لا حاجة لقائمة طويلة هنا.
              </div>
            </>
          )}
        </Section>

        {/* Social / Follow Us Section */}
        <Section icon={<IconShare />} title="قسم تابعنا / السوشيال ميديا" color="bg-purple-50 text-purple-600">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-charcoal">إظهار القسم</label>
            <button
              type="button"
              onClick={() => setSocialEnabled(!socialEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${socialEnabled ? "bg-gold" : "bg-gray-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${socialEnabled ? "translate-x-1" : "translate-x-6"}`} />
            </button>
          </div>

          <Field label="الليبل الصغير" name="socialSectionLabel" defaultValue={settings.socialSectionLabel || "تابعنا"} />
          <Field label="العنوان" name="socialSectionTitle" defaultValue={settings.socialSectionTitle || "@artzonedesign"} />
          <Field label="الوصف" name="socialSectionDescription" defaultValue={settings.socialSectionDescription || "تابع رحلتنا على السوشيال ميديا لمشاهدة أحدث المشاريع والكواليس."} />
          <Field label="نص زرار المتابعة" name="socialSectionButtonText" defaultValue={settings.socialSectionButtonText || "تابعنا على انستغرام"} />

          <GalleryUploader
            label="صور المعرض (حتى 6 صور)"
            value={socialImages}
            onChange={setSocialImages}
          />

          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">عند الضغط على الصورة</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSocialClickAction("lightbox")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${socialClickAction === "lightbox" ? "border-gold bg-gold/10 text-gold" : "border-gray-200 text-warmgray hover:border-gold/50"}`}
              >
                فتح الصورة (Lightbox)
              </button>
              <button
                type="button"
                onClick={() => setSocialClickAction("link")}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${socialClickAction === "link" ? "border-gold bg-gold/10 text-gold" : "border-gray-200 text-warmgray hover:border-gold/50"}`}
              >
                فتح رابط مخصص
              </button>
            </div>
          </div>

          {socialClickAction === "link" && (
            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">الرابط المخصص</label>
              <input
                type="url"
                dir="ltr"
                placeholder="https://example.com"
                value={socialCustomLink}
                onChange={(e) => setSocialCustomLink(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-left outline-none focus:border-gold"
              />
              <p className="mt-1 text-xs text-warmgray">الرابط اللي الصور هتوّدي عليه لما حد يدوس عليها</p>
            </div>
          )}

          <div className="mt-4 border-t border-gray-100 pt-4">
            <h3 className="mb-4 text-sm font-bold text-charcoal">روابط السوشيال ميديا</h3>
            <p className="mb-4 text-xs text-warmgray">أضف الروابط واختر اللي عايز تظهره في الموقع</p>
            <div className="space-y-4">
              {SOCIAL_PLATFORMS.map((p) => (
                <div key={p.key} className="rounded-lg border border-gray-100 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-charcoal" fill="currentColor" viewBox="0 0 24 24"><path d={p.icon} /></svg>
                      <span className="text-sm font-medium text-charcoal">{p.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSocialShow(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${socialShow[p.key] ? "bg-gold" : "bg-gray-300"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${socialShow[p.key] ? "translate-x-1" : "translate-x-6"}`} />
                    </button>
                  </div>
                  <input
                    type="url"
                    dir="ltr"
                    placeholder={`رابط ${p.label}`}
                    value={socialLinks[p.key]}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, [p.key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-left outline-none focus:border-gold"
                  />
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* CTA Banner */}
        <Section icon={<IconMegaphone />} title="بانر الدعوة للتواصل (CTA)" color="bg-yellow-50 text-yellow-700">
          <Field label="العنوان" name="ctaBannerTitle" defaultValue={settings.ctaBannerTitle} />
          <Field label="الوصف" name="ctaBannerDescription" defaultValue={settings.ctaBannerDescription} />
          <Field label="نص الزرار" name="ctaBannerButtonText" defaultValue={settings.ctaBannerButtonText} />
        </Section>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          {saved && <span className="text-sm text-green-600">تم الحفظ بنجاح</span>}
        </div>
      </form>
    </div>
  );
}

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color.split(" ")[0]}`}>
          <span className={color.split(" ")[1]}>{icon}</span>
        </div>
        <h2 className="text-lg font-bold text-charcoal">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, name, defaultValue, type = "text", dir, hint }: { label: string; name: string; defaultValue?: string; type?: string; dir?: string; hint?: string }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-charcoal">{label}</label>
      <input name={name} type={type} dir={dir} defaultValue={defaultValue} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
      {hint && <p className="mt-1 text-xs text-warmgray">{hint}</p>}
    </div>
  );
}


function IconStar() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>; }
function IconUsers() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>; }
function IconGrid() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>; }
function IconQuote() { return <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" /></svg>; }
function IconMegaphone() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>; }
function IconShare() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>; }
function IconBento() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>; }
function IconBook() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.067 0 2.074.33 3 .512v14.25A8.98 8.98 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>; }
