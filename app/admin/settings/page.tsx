"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { SiteSettings } from "@/lib/data";
import { ADMIN_UI_BASE } from "@/lib/admin-path";
import { SingleImageUploader } from "@/components/admin/ImageUploader";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [siteFavicon, setSiteFavicon] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s: SiteSettings) => {
        setSettings(s);
        setLogo(s.logo || null);
        setSiteFavicon(s.siteFavicon || null);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const kwRaw = String(fd.get("siteSeoKeywords") ?? "");
    const siteSeoKeywords = kwRaw.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    const data = {
      ...settings,
      logo,
      siteFavicon,
      siteName: fd.get("siteName"),
      siteDescription: fd.get("siteDescription"),
      publicSiteUrl: String(fd.get("publicSiteUrl") ?? "").trim().replace(/\/$/, "") || settings?.publicSiteUrl,
      siteDefaultTitle: fd.get("siteDefaultTitle"),
      siteTitleTemplate: fd.get("siteTitleTemplate"),
      siteSeoKeywords,
      headerCtaText: fd.get("headerCtaText"),
      headerCtaLink: fd.get("headerCtaLink"),
      footerText: fd.get("footerText"),
      copyrightText: fd.get("copyrightText"),
      instagramHandle: fd.get("instagramHandle"),
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
      <h1 className="text-2xl font-bold text-charcoal">الإعدادات</h1>
      <p className="mt-1 text-sm text-warmgray">إعدادات الموقع العامة</p>
      <p className="mt-3 text-sm">
        <Link href={`${ADMIN_UI_BASE}/contact`} className="font-medium text-gold hover:underline">
          صفحة اتصل بنا
        </Link>
        <span className="text-warmgray"> — تعديل النموذج، العناوين، الواتساب، الخريطة، والبيانات من صفحة مخصصة.</span>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-8">

        {/* Logo & Brand */}
        <Section icon={<IconPaint />} title="الهوية والشعار" color="bg-gold/10 text-gold">
          <SingleImageUploader label="شعار الموقع (Logo)" value={logo} onChange={setLogo} />
          <p className="text-xs text-warmgray">لو مفيش شعار، هيظهر اسم الموقع كنص بدلاً منه. أيقونة التبويب تُؤخذ من قسم «تبويب المتصفح ومحركات البحث» أدناه؛ وإذا لم تُرفع هناك فسيُستخدم هذا الشعار في التبويب.</p>
          <Field label="اسم الموقع (يظهر في الهيدر والميتا)" name="siteName" defaultValue={settings.siteName} />
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">وصف الموقع (نص تعريفي — يُستخدم في الميتا والفوتر)</label>
            <textarea name="siteDescription" rows={3} defaultValue={settings.siteDescription} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
          </div>
        </Section>

        <Section icon={<IconGlobe />} title="تبويب المتصفح ومحركات البحث (SEO)" color="bg-slate-50 text-slate-700">
          <SingleImageUploader label="أيقونة التبويب (Favicon)" value={siteFavicon} onChange={setSiteFavicon} />
          <p className="text-xs text-warmgray">يفضّل صورة مربعة PNG أو ICO (مثلاً 32×32 أو 192×192). لو فاضية يُستخدم favicon الافتراضي للمشروع.</p>
          <Field
            label="الرابط العام للموقع (https)"
            name="publicSiteUrl"
            defaultValue={settings.publicSiteUrl}
            dir="ltr"
            hint="بدون شرطة في النهاية. يُستخدم للكانونيكال، خريطة الموقع، ومشاركة الروابط (مثال: https://example.com)"
          />
          <Field label="عنوان الصفحة الرئيسية في التبويب" name="siteDefaultTitle" defaultValue={settings.siteDefaultTitle} hint="يظهر عند فتح الرئيسية" />
          <Field
            label="قالب عناوين باقي الصفحات"
            name="siteTitleTemplate"
            defaultValue={settings.siteTitleTemplate}
            hint="يجب أن يحتوي على %s — يُستبدل بعنوان الصفحة. مثال: %s | آرت زون"
          />
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">كلمات مفتاحية (SEO) — سطر لكل كلمة أو عبارة</label>
            <textarea
              name="siteSeoKeywords"
              rows={5}
              defaultValue={settings.siteSeoKeywords.join("\n")}
              dir="rtl"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
        </Section>

        {/* Header */}
        <Section icon={<IconMenu />} title="الهيدر (القائمة العلوية)" color="bg-blue-50 text-blue-600">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="نص زرار CTA" name="headerCtaText" defaultValue={settings.headerCtaText} />
            <Field label="رابط زرار CTA" name="headerCtaLink" defaultValue={settings.headerCtaLink} dir="ltr" />
          </div>
        </Section>

        {/* Footer */}
        <Section icon={<IconBuilding />} title="الفوتر (التذييل)" color="bg-purple-50 text-purple-600">
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">نص الفوتر</label>
            <textarea name="footerText" rows={3} defaultValue={settings.footerText} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
          </div>
          <Field label="نص حقوق النشر" name="copyrightText" defaultValue={settings.copyrightText} />
        </Section>

        {/* Instagram (site-wide) */}
        <Section icon={<IconSocial />} title="انستغرام" color="bg-pink-50 text-pink-600">
          <Field label="حساب انستغرام" name="instagramHandle" defaultValue={settings.instagramHandle} dir="ltr" hint="يُستخدم في أقسام الموقع التي تعرض الرابط" />
        </Section>

        <p className="text-sm text-warmgray">
          إعدادات بوابة التصميم (Zoom Portal) متاحة من{" "}
          <Link href={`${ADMIN_UI_BASE}/zoom-portal`} className="font-medium text-gold hover:underline">
            صفحة بوابة التصميم
          </Link>
          .
        </p>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
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

function IconPaint() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.764m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>; }
function IconMenu() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>; }
function IconBuilding() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>; }
function IconSocial() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-4.5 3.75h9M3.75 4.5h16.5v15H3.75V4.5z" /></svg>; }
function IconGlobe() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M12 3a15.9 15.9 0 018 9 15.9 15.9 0 01-8 9 15.9 15.9 0 01-8-9 15.9 15.9 0 018-9z" /></svg>; }
