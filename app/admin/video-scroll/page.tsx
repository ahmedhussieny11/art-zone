"use client";

import { useEffect, useState } from "react";
import type { VideoScrollConfig } from "@/lib/video-scroll-data";
import { VideoUploader } from "@/components/admin/ImageUploader";

export default function VideoScrollAdminPage() {
  const [cfg, setCfg] = useState<VideoScrollConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    fetch("/api/admin/video-scroll")
      .then((r) => r.json())
      .then((data: VideoScrollConfig) => setCfg(data))
      .catch(() => setCfg(null));
  }, []);

  function set<K extends keyof VideoScrollConfig>(
    key: K,
    value: VideoScrollConfig[K]
  ) {
    setCfg((c) => (c ? { ...c, [key]: value } : c));
  }

  async function save() {
    if (!cfg) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/video-scroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      setSaved(true);
      setPreviewKey((k) => k + 1);
      setTimeout(() => setSaved(false), 2400);
    } finally {
      setSaving(false);
    }
  }

  if (!cfg) return <div className="text-warmgray">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">
            قسم الفيديو التفاعلي
          </h1>
          <p className="mt-1 text-sm text-warmgray">
            تحكم كامل في الفيديو والنصوص وسرعة التمرير
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">✓ تم الحفظ</span>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ كل التغييرات"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General toggle */}
        <Card title="الإعدادات العامة" icon="⚙️">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-charcoal">
                تفعيل القسم
              </span>
              <p className="text-xs text-warmgray">
                إظهار / إخفاء القسم في الصفحة الرئيسية
              </p>
            </div>
            <Toggle
              enabled={cfg.enabled}
              onToggle={() => set("enabled", !cfg.enabled)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-charcoal">
                إظهار النصوص فوق الفيديو
              </span>
              <p className="text-xs text-warmgray">
                لو معطّل، يظهر الفيديو فقط بدون عنوان أو وصف
              </p>
            </div>
            <Toggle
              enabled={cfg.showOverlay}
              onToggle={() => set("showOverlay", !cfg.showOverlay)}
            />
          </div>
        </Card>

        {/* Video */}
        <Card title="الفيديو" icon="🎬">
          <VideoUploader
            label="ملف الفيديو"
            value={cfg.videoSrc}
            onChange={(v) => set("videoSrc", v)}
            hint='يُفضّل MP4 معاد ترميزه بكل إطار keyframe (g=1) لسلاسة السكروب. الأمثل ≤ 30 MB.'
          />

          <Input
            label="صورة معاينة (Poster) — اختياري"
            value={cfg.posterSrc}
            onChange={(v) => set("posterSrc", v)}
            dir="ltr"
            placeholder="/poster.jpg"
            hint="تظهر قبل اكتمال تحميل الفيديو"
          />
        </Card>

        {/* Texts */}
        <Card title="النصوص" icon="✍️">
          <Input
            label="الـ Badge الذهبي الصغير"
            value={cfg.label}
            onChange={(v) => set("label", v)}
          />
          <Input
            label="العنوان الرئيسي"
            value={cfg.title}
            onChange={(v) => set("title", v)}
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">
              الوصف
            </label>
            <textarea
              value={cfg.description}
              rows={3}
              onChange={(e) => set("description", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
          <Input
            label="تلميح التمرير (في الأسفل)"
            value={cfg.scrollHint}
            onChange={(v) => set("scrollHint", v)}
            placeholder="↓ مرّر للأسفل"
          />
        </Card>

        {/* Behavior */}
        <Card title="سلوك السكروب" icon="🎚️">
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">
              طول مسافة التمرير (سرعة الحركة)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={2}
                max={10}
                step={0.5}
                value={cfg.scrollMultiplier}
                onChange={(e) =>
                  set("scrollMultiplier", Number(e.target.value))
                }
                className="flex-1 accent-gold"
              />
              <span className="w-16 text-center text-sm font-bold text-gold">
                {cfg.scrollMultiplier}× ({cfg.scrollMultiplier * 100}vh)
              </span>
            </div>
            <p className="mt-1 text-[10px] text-warmgray">
              أصغر = حركة أسرع. أكبر = حركة أبطأ وأكثر فخامة. (الموصى به: 5–7)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">
              نعومة السكروب (Scrub)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.1}
                max={2}
                step={0.1}
                value={cfg.scrub}
                onChange={(e) => set("scrub", Number(e.target.value))}
                className="flex-1 accent-gold"
              />
              <span className="w-12 text-center text-sm font-bold text-gold">
                {cfg.scrub}s
              </span>
            </div>
            <p className="mt-1 text-[10px] text-warmgray">
              أصغر = استجابة فورية. أكبر = حركة ناعمة بتأخير. (الموصى به: 0.5–0.8)
            </p>
          </div>
        </Card>

        {/* Appearance */}
        <Card title="المظهر" icon="🎨">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorInput
              label="لون الخلفية"
              value={cfg.bgColor}
              onChange={(v) => set("bgColor", v)}
            />
            <ColorInput
              label="اللون المميز (الذهبي)"
              value={cfg.accentColor}
              onChange={(v) => set("accentColor", v)}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">
              شدة التظليل (Vignette)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={cfg.vignetteOpacity}
                onChange={(e) =>
                  set("vignetteOpacity", Number(e.target.value))
                }
                className="flex-1 accent-gold"
              />
              <span className="w-12 text-center text-sm font-bold text-gold">
                {cfg.vignetteOpacity}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-warmgray">
              0 = بدون تظليل. 1 = أطراف داكنة بالكامل.
            </p>
          </div>
        </Card>

        {/* Preview link */}
        <Card title="معاينة مباشرة" icon="👁️">
          <p className="text-xs text-warmgray">
            بعد الحفظ، افتح الصفحة الرئيسية لمشاهدة القسم بإعداداتك الجديدة:
          </p>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-5 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              فتح الصفحة الرئيسية
            </a>
            <span
              key={previewKey}
              className="text-xs text-warmgray opacity-0 transition-opacity data-[show=true]:opacity-100"
              data-show={saved}
            >
              تم تحديث المعاينة
            </span>
          </div>
        </Card>
      </div>

      {/* Sticky save */}
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-gold px-8 py-3 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ كل التغييرات"}
        </button>
        {saved && (
          <span className="text-sm text-green-600">✓ تم الحفظ بنجاح</span>
        )}
      </div>
    </div>
  );
}

/* ─── UI helpers (same patterns as the rest of the admin) ──────── */

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-charcoal">
        <span>{icon}</span>
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-7 w-12 rounded-full transition-colors ${
        enabled ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
          enabled ? "right-0.5" : "right-[22px]"
        }`}
      />
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  hint,
  dir,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  dir?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-charcoal">
        {label}
      </label>
      <input
        value={value}
        dir={dir}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold"
      />
      {hint && <p className="mt-1 text-[10px] text-warmgray">{hint}</p>}
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-charcoal">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith("#") ? value : "#C9A96E"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border border-gray-200 p-1"
        />
        <input
          value={value}
          dir="ltr"
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
        />
      </div>
    </div>
  );
}
