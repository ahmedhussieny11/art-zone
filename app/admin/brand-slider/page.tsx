"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  BrandSliderAnimation,
  BrandSliderAspectPreset,
  BrandSliderConfig,
  BrandSliderParallax,
  BrandSliderSizePreset,
  BrandSliderSlide,
} from "@/lib/data";

const ANIM_OPTIONS: { value: BrandSliderAnimation; label: string; hint: string }[] = [
  { value: "soft3d", label: "ثلاثي الأبعاد الناعم", hint: "دوران خفيف + إضاءة" },
  { value: "fade", label: "تلاشي عمودي", hint: "هدوء وبساطة" },
  { value: "slide", label: "انزلاق أفقي", hint: "بدون دوران" },
  { value: "zoom", label: "تكبير / تصغير", hint: "spring" },
  { value: "blur", label: "ضبابية", hint: "انتقال ناعم مع blur" },
];

const PARALLAX_OPTIONS: { value: BrandSliderParallax; label: string }[] = [
  { value: "off", label: "بدون" },
  { value: "low", label: "خفيف" },
  { value: "medium", label: "متوسط" },
  { value: "high", label: "قوي" },
];

const ASPECT_OPTIONS: { value: BrandSliderAspectPreset; label: string }[] = [
  { value: "1/1", label: "مربع 1:1" },
  { value: "4/3", label: "كلاسيكي 4:3" },
  { value: "16/9", label: "عرضي 16:9" },
  { value: "21/9", label: "سينمائي 21:9" },
  { value: "3/4", label: "عمودي 3:4" },
];

const SIZE_OPTIONS: { value: BrandSliderSizePreset; label: string }[] = [
  { value: "sm", label: "صغير (~52vh)" },
  { value: "md", label: "متوسط (~65vh)" },
  { value: "lg", label: "كبير (~78vh)" },
  { value: "xl", label: "عريض (~88vh)" },
  { value: "full", label: "أقصى (~96vh)" },
];

function newSlideId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AdminBrandSliderPage() {
  const [cfg, setCfg] = useState<BrandSliderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/brand-slider");
    const j = (await r.json()) as BrandSliderConfig;
    setCfg(j);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!cfg) return;
    setSaving(true);
    setErr("");
    const r = await fetch("/api/admin/brand-slider", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    if (!r.ok) {
      setErr("فشل الحفظ");
      setSaving(false);
      return;
    }
    const j = await r.json();
    setCfg(j.config as BrandSliderConfig);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function patch<K extends keyof BrandSliderConfig>(key: K, value: BrandSliderConfig[K]) {
    setCfg((c) => (c ? { ...c, [key]: value } : null));
  }

  function patchSlide(i: number, slide: BrandSliderSlide) {
    setCfg((c) => {
      if (!c) return null;
      const slides = [...c.slides];
      slides[i] = slide;
      return { ...c, slides };
    });
  }

  function removeSlide(i: number) {
    setCfg((c) => (c ? { ...c, slides: c.slides.filter((_, j) => j !== i) } : null));
  }

  function moveSlide(i: number, dir: -1 | 1) {
    setCfg((c) => {
      if (!c) return null;
      const j = i + dir;
      if (j < 0 || j >= c.slides.length) return c;
      const slides = [...c.slides];
      [slides[i], slides[j]] = [slides[j], slides[i]];
      return { ...c, slides };
    });
  }

  function addSlide() {
    setCfg((c) => {
      if (!c) return null;
      return {
        ...c,
        slides: [
          ...c.slides,
          { id: newSlideId(), src: "", title: "عنوان جديد", subtitle: "وصف قصير" },
        ],
      };
    });
  }

  async function uploadForIndex(index: number, files: FileList | null) {
    if (!files?.length || !cfg) return;
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f);
    const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await r.json();
    if (!r.ok || !j.paths?.[0]) {
      setErr(typeof j.error === "string" ? j.error : "فشل الرفع");
      return;
    }
    patchSlide(index, { ...cfg.slides[index], src: j.paths[0] as string });
  }

  if (loading || !cfg) {
    return <div className="text-warmgray">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-charcoal">سلايدر معرض الصور (الرئيسية)</h1>
      <p className="mt-1 text-sm text-warmgray">الصور، النصوص، المقاس، ونوع الحركة بين الشرائح</p>

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

      <div className="mt-8 space-y-8 rounded-xl bg-white p-6 shadow-sm">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={(e) => patch("enabled", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
          />
          <span className="text-sm font-medium text-charcoal">تفعيل القسم في الموقع</span>
        </label>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-charcoal">عنوان القسم (فوق السلايدر)</h2>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-warmgray">
            <input
              type="checkbox"
              checked={cfg.showSectionHeader}
              onChange={(e) => patch("showSectionHeader", e.target.checked)}
            />
            إظهار
          </label>
          <input
            className="mt-2 w-full border border-gray-200 px-3 py-2 text-sm"
            value={cfg.sectionEyebrow}
            onChange={(e) => patch("sectionEyebrow", e.target.value)}
            placeholder="سطر صغير (مثلاً: ديكور · تشطيبات)"
          />
          <input
            className="mt-2 w-full border border-gray-200 px-3 py-2 text-sm"
            value={cfg.sectionTitle}
            onChange={(e) => patch("sectionTitle", e.target.value)}
            placeholder="عنوان اختياري (اتركه فارغاً إن لم ترد)"
          />
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-charcoal">مقاس الإطار</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-warmgray">نسبة العرض إلى الارتفاع</label>
              <select
                className="w-full border border-gray-200 px-3 py-2 text-sm"
                value={cfg.aspectPreset}
                onChange={(e) => patch("aspectPreset", e.target.value as BrandSliderAspectPreset)}
              >
                {ASPECT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-warmgray">حجم العرض (حد ارتفاع الشاشة)</label>
              <select
                className="w-full border border-gray-200 px-3 py-2 text-sm"
                value={cfg.sizePreset}
                onChange={(e) => patch("sizePreset", e.target.value as BrandSliderSizePreset)}
              >
                {SIZE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-charcoal">الحركة والتفاعل</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-warmgray">انتقال الشرائح</label>
              <select
                className="w-full border border-gray-200 px-3 py-2 text-sm"
                value={cfg.animation}
                onChange={(e) => patch("animation", e.target.value as BrandSliderAnimation)}
              >
                {ANIM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} title={o.hint}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-warmgray">ميل الصورة مع الماوس (Parallax)</label>
              <select
                className="w-full border border-gray-200 px-3 py-2 text-sm"
                value={cfg.parallax}
                onChange={(e) => patch("parallax", e.target.value as BrandSliderParallax)}
              >
                {PARALLAX_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-warmgray">مدة عرض كل شريحة قبل التبديل (ملّي ثانية)</label>
              <input
                type="number"
                min={2000}
                max={60000}
                step={500}
                className="w-full max-w-xs border border-gray-200 px-3 py-2 text-sm"
                value={cfg.autoMs}
                onChange={(e) => patch("autoMs", Math.min(60000, Math.max(2000, parseInt(e.target.value, 10) || 6500)))}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-charcoal">النص فوق الصورة</h2>
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-warmgray">
            <input
              type="checkbox"
              checked={cfg.showTextOverlay}
              onChange={(e) => patch("showTextOverlay", e.target.checked)}
            />
            إظهار عنوان ووصف كل شريحة
          </label>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-charcoal">الأزرار أسفل السلايدر</h2>
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-warmgray">
            <input type="checkbox" checked={cfg.showCta} onChange={(e) => patch("showCta", e.target.checked)} />
            إظهار
          </label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              className="border border-gray-200 px-3 py-2 text-sm"
              value={cfg.cta1Text}
              onChange={(e) => patch("cta1Text", e.target.value)}
              placeholder="نص الزر 1"
            />
            <input
              className="border border-gray-200 px-3 py-2 text-sm"
              dir="ltr"
              value={cfg.cta1Href}
              onChange={(e) => patch("cta1Href", e.target.value)}
              placeholder="/portfolio"
            />
            <input
              className="border border-gray-200 px-3 py-2 text-sm"
              value={cfg.cta2Text}
              onChange={(e) => patch("cta2Text", e.target.value)}
              placeholder="نص الزر 2"
            />
            <input
              className="border border-gray-200 px-3 py-2 text-sm"
              dir="ltr"
              value={cfg.cta2Href}
              onChange={(e) => patch("cta2Href", e.target.value)}
              placeholder="/contact"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-charcoal">الشرائح ({cfg.slides.length})</h2>
          <button
            type="button"
            onClick={addSlide}
            className="rounded-sm bg-charcoal px-4 py-2 text-xs font-medium text-white hover:bg-charcoal/90"
          >
            + إضافة شريحة
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {cfg.slides.map((slide, i) => (
            <div key={slide.id} className="rounded-lg border border-gray-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <span className="text-xs text-warmgray">شريحة {i + 1}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveSlide(i, -1)}
                    className="text-xs text-gold hover:underline disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === cfg.slides.length - 1}
                    onClick={() => moveSlide(i, 1)}
                    className="text-xs text-gold hover:underline disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button type="button" onClick={() => removeSlide(i)} className="text-xs text-red-600 hover:underline">
                    حذف
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4">
                <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded bg-gray-100">
                  {slide.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slide.src} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-warmgray">لا صورة</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <label className="text-xs text-warmgray">رابط الصورة</label>
                    <input
                      className="mt-0.5 w-full border border-gray-200 px-2 py-1.5 text-sm"
                      dir="ltr"
                      value={slide.src}
                      onChange={(e) => patchSlide(i, { ...slide, src: e.target.value })}
                      placeholder="/uploads/.... أو /slider-showcase-1.png"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-warmgray">رفع ملف</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-0.5 block w-full text-xs"
                      onChange={(e) => uploadForIndex(i, e.target.files)}
                    />
                  </div>
                </div>
              </div>

              <input
                className="mt-3 w-full border border-gray-200 px-3 py-2 text-sm"
                value={slide.title}
                onChange={(e) => patchSlide(i, { ...slide, title: e.target.value })}
                placeholder="العنوان"
              />
              <textarea
                className="mt-2 w-full border border-gray-200 px-3 py-2 text-sm"
                rows={2}
                value={slide.subtitle}
                onChange={(e) => patchSlide(i, { ...slide, subtitle: e.target.value })}
                placeholder="الوصف"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="rounded-sm bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
        {saved && <span className="text-sm text-green-600">تم الحفظ</span>}
      </div>
    </div>
  );
}
