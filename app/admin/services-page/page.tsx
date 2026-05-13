"use client";

import { useState, useEffect } from "react";
import type { SiteSettings } from "@/lib/data";

interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export default function ServicesPageAdmin() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [steps, setSteps] = useState<ProcessStep[]>([
    { step: "٠١", title: "الاستشارة", description: "نبدأ باستشارة معمّقة لفهم رؤيتك وأسلوب حياتك ومتطلباتك." },
    { step: "٠٢", title: "تطوير المفهوم", description: "يبتكر مصممونا مفهوماً شاملاً يتضمن لوحات الإلهام والتخطيطات واختيار المواد." },
    { step: "٠٣", title: "التصميم والتفاصيل", description: "يتم صقل كل عنصر بالرسومات الفنية والتصورات ثلاثية الأبعاد والمواصفات التفصيلية." },
    { step: "٠٤", title: "التنفيذ", description: "فريقنا يدير عملية البناء بالكامل، لضمان تنفيذ التصميم بأعلى المعايير." },
  ]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s: SiteSettings) => {
        setSettings(s);
        if (s.processSteps?.length) setSteps(s.processSteps);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      ...settings,
      servicesPageLabel: fd.get("servicesPageLabel"),
      servicesPageTitle: fd.get("servicesPageTitle"),
      servicesPageDescription: fd.get("servicesPageDescription"),
      servicesPageButtonText: fd.get("servicesPageButtonText"),
      processLabel: fd.get("processLabel"),
      processTitle: fd.get("processTitle"),
      processDescription: fd.get("processDescription"),
      processSteps: steps,
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

  function updateStep(index: number, field: keyof ProcessStep, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addStep() {
    const num = steps.length + 1;
    const arabicNums = ["٠١", "٠٢", "٠٣", "٠٤", "٠٥", "٠٦", "٠٧", "٠٨", "٠٩", "١٠"];
    setSteps((prev) => [...prev, { step: arabicNums[num - 1] || `${num}`, title: "", description: "" }]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  if (!settings) return <div className="text-warmgray">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">صفحة خدماتنا</h1>
      <p className="mt-1 text-sm text-warmgray">تحكم في محتوى صفحة الخدمات ومراحل العمل</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-8">

        {/* Hero Section */}
        <Section icon={<IconService />} title="القسم الرئيسي" color="bg-rose-50 text-rose-600">
          <Field label="الليبل الصغير" name="servicesPageLabel" defaultValue={settings.servicesPageLabel || "ماذا نقدم"} />
          <Field label="العنوان" name="servicesPageTitle" defaultValue={settings.servicesPageTitle || "خدماتنا"} />
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">الوصف</label>
            <textarea name="servicesPageDescription" rows={3} defaultValue={settings.servicesPageDescription || "من الفكرة الأولى إلى التنفيذ النهائي، نقدم حلول تصميم شاملة مصممة خصيصاً لرؤيتك الفريدة."} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
          </div>
          <Field label="نص زرار الخدمة" name="servicesPageButtonText" defaultValue={settings.servicesPageButtonText || "اطلب الخدمة"} hint="النص اللي بيظهر تحت كل خدمة" />
        </Section>

        {/* Process Section */}
        <Section icon={<IconProcess />} title="مراحل العمل" color="bg-teal-50 text-teal-600">
          <Field label="الليبل الصغير" name="processLabel" defaultValue={settings.processLabel || "كيف نعمل"} />
          <Field label="العنوان" name="processTitle" defaultValue={settings.processTitle || "مراحل العمل"} />
          <Field label="الوصف" name="processDescription" defaultValue={settings.processDescription || "رحلة سلسة من فكرتك الأولى إلى مساحة متكاملة."} />

          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-charcoal">الخطوات</h3>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center gap-1 rounded-lg border border-gold/30 px-3 py-1.5 text-xs font-medium text-gold transition-colors hover:bg-gold/5"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                إضافة خطوة
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-serif text-2xl font-light text-gold/40">{step.step}</span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-charcoal">الرقم</label>
                      <input
                        value={step.step}
                        onChange={(e) => updateStep(i, "step", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-charcoal">العنوان</label>
                      <input
                        value={step.title}
                        onChange={(e) => updateStep(i, "title", e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-charcoal">الوصف</label>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(i, "description", e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
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

function Field({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue?: string; hint?: string }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-charcoal">{label}</label>
      <input name={name} type="text" defaultValue={defaultValue} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
      {hint && <p className="mt-1 text-xs text-warmgray">{hint}</p>}
    </div>
  );
}

function IconService() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );
}

function IconProcess() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  );
}
