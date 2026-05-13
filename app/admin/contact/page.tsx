"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { SiteSettings } from "@/lib/data";

function FormToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-7 w-12 rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${enabled ? "right-0.5" : "right-[22px]"}`}
      />
    </button>
  );
}

function StringListEditor({
  label,
  hint,
  items,
  onChange,
  addLabel,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (next: string[]) => void;
  addLabel: string;
}) {
  function update(i: number, v: string) {
    const next = [...items];
    next[i] = v;
    onChange(next);
  }
  function remove(i: number) {
    onChange(items.filter((_, j) => j !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-charcoal">{label}</label>
      <div className="space-y-2">
        {items.map((row, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={row}
              onChange={(e) => update(i, e.target.value)}
              className="min-w-[12rem] flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold"
              dir="rtl"
            />
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded border border-gray-200 px-2 py-1 text-xs text-charcoal hover:bg-gray-50 disabled:opacity-30"
                title="أعلى"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="rounded border border-gray-200 px-2 py-1 text-xs text-charcoal hover:bg-gray-50 disabled:opacity-30"
                title="أسفل"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 text-sm font-medium text-gold hover:text-gold-dark"
      >
        + {addLabel}
      </button>
      {hint && <p className="mt-1 text-xs text-warmgray">{hint}</p>}
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

function CField({
  label,
  value,
  onChange,
  type = "text",
  dir,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dir?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-charcoal">{label}</label>
      <input
        type={type}
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
      />
      {hint && <p className="mt-1 text-xs text-warmgray">{hint}</p>}
    </div>
  );
}

export default function AdminContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s: SiteSettings) => setSettings(s));
  }, []);

  function patch<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    const cleaned: SiteSettings = {
      ...settings,
      contactServiceOptions: settings.contactServiceOptions.map((x) => x.trim()).filter(Boolean),
      contactBudgetRanges: settings.contactBudgetRanges.map((x) => x.trim()).filter(Boolean),
    };
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleaned),
    });
    const fresh = await fetch("/api/admin/settings").then((r) => r.json() as Promise<SiteSettings>);
    setSettings(fresh);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!settings) {
    return <div className="text-warmgray">جاري التحميل...</div>;
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">صفحة اتصل بنا</h1>
          <p className="mt-1 text-sm text-warmgray">تحكم كامل في محتوى الصفحة، النموذج، القائمة الجانبية، الواتساب، والخريطة.</p>
        </div>
        <Link
          href="/contact"
          target="_blank"
          className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-charcoal hover:border-gold hover:text-gold"
        >
          عرض الصفحة
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </Link>
      </div>

      <form onSubmit={handleSave} className="mt-8 max-w-3xl space-y-8">
        <Section icon={<IconPage />} title="رأس الصفحة والنموذج" color="bg-indigo-50 text-indigo-600">
          <div className="grid gap-5 sm:grid-cols-2">
            <CField label="عنوان الصفحة (في الهيرو)" value={settings.contactPageTitle} onChange={(v) => patch("contactPageTitle", v)} />
            <CField label="عنوان النموذج" value={settings.contactFormTitle} onChange={(v) => patch("contactFormTitle", v)} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">وصف الصفحة (تحت العنوان)</label>
            <textarea
              value={settings.contactPageSubtitle}
              onChange={(e) => patch("contactPageSubtitle", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">وصف النموذج</label>
            <textarea
              value={settings.contactFormSubtitle}
              onChange={(e) => patch("contactFormSubtitle", e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
        </Section>

        <Section icon={<IconForm />} title="حقول النموذج" color="bg-gold/10 text-gold">
          <CField
            label="نص توضيحي لحقل الجوال (placeholder)"
            value={settings.contactPhonePlaceholder}
            onChange={(v) => patch("contactPhonePlaceholder", v)}
            dir="ltr"
            hint="مثال مصر: +20 1XX XXX XXXX أو 01XXXXXXXXX"
          />
          <StringListEditor
            label="خيارات «نوع الخدمة» (ترتيب القائمة)"
            items={settings.contactServiceOptions}
            onChange={(next) => patch("contactServiceOptions", next)}
            addLabel="إضافة خيار خدمة"
            hint="الترتيب هنا هو ترتيب الظهور في القائمة المنسدلة."
          />
          <StringListEditor
            label="خيارات «نطاق الميزانية»"
            items={settings.contactBudgetRanges}
            onChange={(next) => patch("contactBudgetRanges", next)}
            addLabel="إضافة نطاق ميزانية"
            hint="اكتب المبالغ بالجنيه أو أي صيغة تناسبك."
          />
        </Section>

        <Section icon={<IconSidebar />} title="العمود الجانبي (بجانب النموذج)" color="bg-teal-50 text-teal-600">
          <p className="text-xs text-warmgray">عناوين البلوكات فقط؛ القيم (البريد، العنوان، الساعات) في القسم التالي.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <CField label="عنوان بلوك واتساب" value={settings.contactWhatsappTitle} onChange={(v) => patch("contactWhatsappTitle", v)} />
            <CField label="نص رابط واتساب" value={settings.contactWhatsappCta} onChange={(v) => patch("contactWhatsappCta", v)} />
            <CField label="سطر تحت رابط واتساب" value={settings.contactWhatsappHint} onChange={(v) => patch("contactWhatsappHint", v)} />
            <CField label="عنوان بلوك البريد" value={settings.contactEmailTitle} onChange={(v) => patch("contactEmailTitle", v)} />
            <CField label="عنوان بلوك العنوان / الاستوديو" value={settings.contactStudioTitle} onChange={(v) => patch("contactStudioTitle", v)} />
            <CField label="عنوان بلوك ساعات العمل" value={settings.contactHoursTitle} onChange={(v) => patch("contactHoursTitle", v)} />
          </div>
        </Section>

        <Section icon={<IconPin />} title="البيانات المعروضة في الجانب" color="bg-green-50 text-green-600">
          <div className="grid gap-5 sm:grid-cols-2">
            <CField label="البريد الإلكتروني" value={settings.email} onChange={(v) => patch("email", v)} type="email" dir="ltr" />
            <CField label="العنوان" value={settings.address} onChange={(v) => patch("address", v)} />
            <CField label="ملاحظة تحت العنوان" value={settings.addressNote} onChange={(v) => patch("addressNote", v)} hint="مثال: بموعد مسبق فقط" />
            <CField label="سطر ساعات العمل" value={settings.workingHours} onChange={(v) => patch("workingHours", v)} />
            <CField label="سطر أيام الإغلاق" value={settings.closedDays} onChange={(v) => patch("closedDays", v)} />
          </div>
        </Section>

        <Section icon={<IconWhatsApp />} title="واتساب (الرابط في الصفحة + الزر العائم)" color="bg-[#25D366]/10 text-[#25D366]">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-charcoal">تفعيل الزر العائم</span>
              <p className="text-xs text-warmgray">الزر الأخضر في أسفل كل الصفحات</p>
            </div>
            <FormToggle
              enabled={settings.whatsappEnabled !== false}
              onToggle={() => patch("whatsappEnabled", !(settings.whatsappEnabled !== false))}
            />
          </div>
          <CField
            label="رقم الواتساب"
            value={settings.whatsappNumber}
            onChange={(v) => patch("whatsappNumber", v)}
            dir="ltr"
            hint="مع رمز الدولة، مثال: +201012345678"
          />
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">رسالة واتساب الافتراضية</label>
            <textarea
              value={settings.whatsappMessage}
              onChange={(e) => patch("whatsappMessage", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
        </Section>

        <Section icon={<IconMap />} title="خريطة جوجل (أسفل الصفحة)" color="bg-sky-50 text-sky-600">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-charcoal">إظهار الخريطة</span>
              <p className="text-xs text-warmgray">قسم iframe أسفل صفحة اتصل بنا</p>
            </div>
            <FormToggle
              enabled={settings.googleMapsEnabled !== false}
              onToggle={() => patch("googleMapsEnabled", !(settings.googleMapsEnabled !== false))}
            />
          </div>
          {settings.googleMapsEnabled !== false && (
            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">رابط التضمين (Embed URL)</label>
              <input
                type="url"
                dir="ltr"
                value={settings.googleMapsUrl}
                onChange={(e) => patch("googleMapsUrl", e.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
              />
            </div>
          )}
        </Section>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving} className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ كل التغييرات"}
          </button>
          {saved && <span className="text-sm text-green-600">تم الحفظ بنجاح</span>}
        </div>

        <p className="text-xs text-warmgray">
          حساب انستغرام العام ما زال يُعدّل من <Link href="/admin/settings" className="text-gold hover:underline">الإعدادات</Link> إن احتجت ذلك للهيدر أو أماكن أخرى.
        </p>
      </form>
    </div>
  );
}

function IconPage() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75m8.25 0a3.375 3.375 0 013.375 3.375V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V9.75a3.375 3.375 0 013.375-3.375h5.025m5.97 0H18" />
    </svg>
  );
}
function IconForm() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
    </svg>
  );
}
function IconSidebar() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v12a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 18V6z" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}
function IconWhatsApp() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
function IconMap() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-15.499l7.5 3.75v11.25l-7.5-3.75v-11.25zm-6 0L2.25 3.75v11.25l7.5 3.75v-11.25z" />
    </svg>
  );
}
