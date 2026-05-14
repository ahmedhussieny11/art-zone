"use client";

import { useState, useEffect } from "react";
import type { SiteSettings } from "@/lib/data";

const DEFAULT_COLORS = {
  offwhite: "#F5F0EB",
  charcoal: "#2C2C2C",
  warmgray: "#8A8078",
  gold: "#C9A96E",
  goldLight: "#D4BA8A",
  goldDark: "#B89555",
};

const DEFAULT_SVC_COLORS = {
  heroBg: "#2C2C2C",
  heroText: "#FFFFFF",
  cardBg: "#FFFFFF",
  cardText: "#2C2C2C",
  processBg: "#FFFFFF",
};

const COLOR_PRESETS = [
  {
    name: "كلاسيكي (الافتراضي)",
    colors: { offwhite: "#F5F0EB", charcoal: "#2C2C2C", warmgray: "#8A8078", gold: "#C9A96E", goldLight: "#D4BA8A", goldDark: "#B89555" },
  },
  {
    name: "أزرق ملكي",
    colors: { offwhite: "#F0F4F8", charcoal: "#1A2332", warmgray: "#6B7B8D", gold: "#4A90D9", goldLight: "#7AB3E8", goldDark: "#2D6CB5" },
  },
  {
    name: "أخضر فاخر",
    colors: { offwhite: "#F2F5F0", charcoal: "#1E2D24", warmgray: "#6D7D6F", gold: "#7BAE6E", goldLight: "#9BC88F", goldDark: "#5A8E4E" },
  },
  {
    name: "وردي أنيق",
    colors: { offwhite: "#FDF2F4", charcoal: "#2D1F23", warmgray: "#8A7478", gold: "#D4849A", goldLight: "#E6A7B8", goldDark: "#BA6580" },
  },
  {
    name: "داكن فخم",
    colors: { offwhite: "#1A1A1A", charcoal: "#F5F0EB", warmgray: "#9A9590", gold: "#C9A96E", goldLight: "#D4BA8A", goldDark: "#B89555" },
  },
];

export default function AppearancePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [fontScale, setFontScale] = useState(100);
  const [sectionLabelSize, setSectionLabelSize] = useState("sm");
  const [sectionTitleSize, setSectionTitleSize] = useState("5xl");
  const [sectionBodySize, setSectionBodySize] = useState("lg");

  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [svcColors, setSvcColors] = useState(DEFAULT_SVC_COLORS);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s: SiteSettings) => {
        setSettings(s);
        setFontScale(s.fontScale || 100);
        setSectionLabelSize(s.sectionLabelSize || "sm");
        setSectionTitleSize(s.sectionTitleSize || "5xl");
        setSectionBodySize(s.sectionBodySize || "lg");
        if (s.colors) setColors((prev) => ({ ...prev, ...s.colors }));
        if (s.servicesColors) setSvcColors((prev) => ({ ...prev, ...s.servicesColors }));
      });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...settings,
      fontScale,
      sectionLabelSize,
      sectionTitleSize,
      sectionBodySize,
      colors,
      servicesColors: svcColors,
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

  function applyPreset(preset: typeof COLOR_PRESETS[number]) {
    setColors(preset.colors);
  }

  function resetColors() {
    setColors(DEFAULT_COLORS);
  }

  function resetSvcColors() {
    setSvcColors(DEFAULT_SVC_COLORS);
  }

  if (!settings) return <div className="text-warmgray">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">المظهر والألوان</h1>
      <p className="mt-1 text-sm text-warmgray">تحكم في ألوان الموقع وحجم الخطوط وثيم صفحة الخدمات</p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-8">

        {/* Color Presets */}
        <Section icon={<IconPalette />} title="ثيمات جاهزة" color="bg-violet-50 text-violet-600">
          <p className="text-xs text-warmgray">اختر ثيم جاهز أو خصّص الألوان يدوياً</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => applyPreset(preset)}
                className="group rounded-lg border border-gray-200 p-3 text-right transition-all hover:border-gold hover:shadow-sm"
              >
                <div className="mb-2 flex gap-1">
                  {Object.values(preset.colors).map((c, i) => (
                    <div key={i} className="h-5 w-5 rounded-full border border-gray-200" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-xs font-medium text-charcoal">{preset.name}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Global Colors */}
        <Section icon={<IconColor />} title="ألوان الموقع الرئيسية" color="bg-amber-50 text-amber-600">
          <div className="flex items-center justify-between">
            <p className="text-xs text-warmgray">الألوان دي بتأثر على الموقع بالكامل</p>
            <button type="button" onClick={resetColors} className="text-xs text-warmgray hover:text-gold">إعادة الافتراضي</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="لون الخلفية الرئيسية" hint="خلفية الصفحات" value={colors.offwhite} onChange={(v) => setColors((p) => ({ ...p, offwhite: v }))} />
            <ColorField label="لون النصوص الداكنة" hint="العناوين والنصوص الأساسية" value={colors.charcoal} onChange={(v) => setColors((p) => ({ ...p, charcoal: v }))} />
            <ColorField label="لون النصوص الثانوية" hint="الفقرات والوصف" value={colors.warmgray} onChange={(v) => setColors((p) => ({ ...p, warmgray: v }))} />
            <ColorField label="اللون المميز (الذهبي)" hint="الأزرار والعلامات والروابط" value={colors.gold} onChange={(v) => setColors((p) => ({ ...p, gold: v }))} />
            <ColorField label="اللون المميز الفاتح" hint="تدرج فاتح من اللون المميز" value={colors.goldLight} onChange={(v) => setColors((p) => ({ ...p, goldLight: v }))} />
            <ColorField label="اللون المميز الداكن" hint="Hover والحالات النشطة" value={colors.goldDark} onChange={(v) => setColors((p) => ({ ...p, goldDark: v }))} />
          </div>

          {/* Live Preview */}
          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
            <div className="p-4 text-center" style={{ backgroundColor: colors.offwhite }}>
              <span className="text-xs font-semibold tracking-widest" style={{ color: colors.gold }}>معاينة حية</span>
              <h3 className="mt-1 font-serif text-xl" style={{ color: colors.charcoal }}>هكذا سيبدو الموقع</h3>
              <p className="mt-1 text-sm" style={{ color: colors.warmgray }}>هذا النص يمثل الفقرات والوصف في الموقع</p>
              <div className="mt-3 inline-flex gap-2">
                <span className="rounded px-3 py-1 text-xs text-white" style={{ backgroundColor: colors.gold }}>زرار رئيسي</span>
                <span className="rounded border px-3 py-1 text-xs" style={{ borderColor: colors.gold, color: colors.gold }}>زرار ثانوي</span>
              </div>
            </div>
            <div className="p-4 text-center" style={{ backgroundColor: colors.charcoal }}>
              <span className="text-xs font-semibold tracking-widest" style={{ color: colors.gold }}>الأقسام الداكنة</span>
              <p className="mt-1 text-sm" style={{ color: colors.offwhite + "99" }}>هكذا تبدو الأقسام بالخلفية الداكنة</p>
            </div>
          </div>
        </Section>

        {/* Services Page Colors */}
        <Section icon={<IconService />} title="ألوان صفحة خدماتنا" color="bg-rose-50 text-rose-600">
          <div className="flex items-center justify-between">
            <p className="text-xs text-warmgray">ألوان مخصصة لصفحة الخدمات</p>
            <button type="button" onClick={resetSvcColors} className="text-xs text-warmgray hover:text-gold">إعادة الافتراضي</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="خلفية الهيدر" hint="خلفية القسم الرئيسي في الأعلى" value={svcColors.heroBg} onChange={(v) => setSvcColors((p) => ({ ...p, heroBg: v }))} />
            <ColorField label="نص الهيدر" hint="لون النص في القسم الرئيسي" value={svcColors.heroText} onChange={(v) => setSvcColors((p) => ({ ...p, heroText: v }))} />
            <ColorField label="خلفية كروت الخدمات" hint="خلفية كل كارت خدمة" value={svcColors.cardBg} onChange={(v) => setSvcColors((p) => ({ ...p, cardBg: v }))} />
            <ColorField label="نص كروت الخدمات" hint="لون العنوان في كروت الخدمات" value={svcColors.cardText} onChange={(v) => setSvcColors((p) => ({ ...p, cardText: v }))} />
            <ColorField label="خلفية مراحل العمل" hint="خلفية قسم مراحل العمل" value={svcColors.processBg} onChange={(v) => setSvcColors((p) => ({ ...p, processBg: v }))} />
          </div>

          {/* Services Preview */}
          <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
            <div className="p-4 text-center" style={{ backgroundColor: svcColors.heroBg }}>
              <span className="text-xs font-semibold tracking-widest" style={{ color: colors.gold }}>ماذا نقدم</span>
              <h3 className="mt-1 font-serif text-lg" style={{ color: svcColors.heroText }}>خدماتنا</h3>
              <p className="mt-1 text-xs" style={{ color: svcColors.heroText + "99" }}>حلول تصميم شاملة مصممة خصيصاً لرؤيتك</p>
            </div>
            <div className="flex gap-2 p-3" style={{ backgroundColor: colors.offwhite }}>
              {["التصميم", "التشطيبات", "الإشراف"].map((t) => (
                <div key={t} className="flex-1 rounded p-2 text-center text-xs" style={{ backgroundColor: svcColors.cardBg, color: svcColors.cardText }}>
                  {t}
                </div>
              ))}
            </div>
            <div className="p-3 text-center text-xs" style={{ backgroundColor: svcColors.processBg, color: colors.charcoal }}>
              مراحل العمل
            </div>
          </div>
        </Section>

        <Section icon={<IconMoon />} title="الوضع الداكن للزوار" color="bg-slate-100 text-slate-700">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold"
              checked={settings.darkModeEnabled === true}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, darkModeEnabled: e.target.checked } : null))
              }
            />
            <span>
              <span className="font-medium text-charcoal">تفعيل زر الفاتح / الداكن في شريط التنقل</span>
              <span className="mt-1 block text-xs leading-relaxed text-warmgray">
                عند الإيقاف، الموقع للزوار يبقى بالوضع الفاتح فقط. لوحة التحكم لا تتأثر.
              </span>
            </span>
          </label>
        </Section>

        {/* Font Sizes */}
        <Section icon={<IconFont />} title="حجم الخطوط" color="bg-teal-50 text-teal-600">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">الحجم العام للموقع</label>
              <div className="flex items-center gap-4">
                <input type="range" min={80} max={150} step={5} value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-gold" />
                <span className="w-16 text-center text-lg font-bold text-charcoal">{fontScale}%</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[{ label: "صغير", value: 85 }, { label: "متوسط", value: 100 }, { label: "كبير", value: 115 }, { label: "كبير جداً", value: 130 }].map((p) => (
                  <button key={p.value} type="button" onClick={() => setFontScale(p.value)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${fontScale === p.value ? "border-gold bg-gold/10 text-gold" : "border-gray-200 text-warmgray hover:border-gold/50"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">حجم ليبل الأقسام <span className="text-warmgray">(من نحن، أعمالنا...)</span></label>
              <div className="flex flex-wrap gap-2">
                {[{ label: "صغير", value: "xs" }, { label: "متوسط", value: "sm" }, { label: "كبير", value: "base" }, { label: "كبير جداً", value: "lg" }, { label: "ضخم", value: "xl" }].map((p) => (
                  <button key={p.value} type="button" onClick={() => setSectionLabelSize(p.value)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${sectionLabelSize === p.value ? "border-gold bg-gold/10 text-gold" : "border-gray-200 text-warmgray hover:border-gold/50"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">حجم عنوان الأقسام <span className="text-warmgray">(مشاريع مميزة...)</span></label>
              <div className="flex flex-wrap gap-2">
                {[{ label: "متوسط", value: "3xl" }, { label: "كبير", value: "4xl" }, { label: "كبير جداً", value: "5xl" }, { label: "ضخم", value: "6xl" }, { label: "ضخم جداً", value: "7xl" }].map((p) => (
                  <button key={p.value} type="button" onClick={() => setSectionTitleSize(p.value)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${sectionTitleSize === p.value ? "border-gold bg-gold/10 text-gold" : "border-gray-200 text-warmgray hover:border-gold/50"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">حجم نص الوصف <span className="text-warmgray">(الفقرات تحت العناوين)</span></label>
              <div className="flex flex-wrap gap-2">
                {[{ label: "صغير", value: "sm" }, { label: "متوسط", value: "base" }, { label: "كبير", value: "lg" }, { label: "كبير جداً", value: "xl" }, { label: "ضخم", value: "2xl" }].map((p) => (
                  <button key={p.value} type="button" onClick={() => setSectionBodySize(p.value)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${sectionBodySize === p.value ? "border-gold bg-gold/10 text-gold" : "border-gray-200 text-warmgray hover:border-gold/50"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs text-warmgray mb-3">معاينة:</p>
              <span className={`mb-2 inline-block font-semibold tracking-[0.15em] text-gold text-${sectionLabelSize}`}>من نحن</span>
              <p className={`font-serif font-light leading-tight text-charcoal text-${sectionTitleSize}`}>نُعرّف الفخامة من خلال التصميم</p>
              <p className={`mt-3 text-warmgray leading-relaxed text-${sectionBodySize}`}>في آرت زون للتصميم، نؤمن بأن المساحات الاستثنائية تروي قصة.</p>
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

/* --- Reusable Components --- */

function ColorField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <label className="mb-1 block text-xs font-medium text-charcoal">{label}</label>
      <p className="mb-2 text-[10px] text-warmgray">{hint}</p>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-9 cursor-pointer rounded-lg border border-gray-200 p-0.5"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono text-left outline-none focus:border-gold"
        />
      </div>
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

function IconPalette() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" /></svg>; }
function IconMoon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  );
}
function IconColor() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>; }
function IconFont() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h6.5M3 7H1m2 0h2m12-2h4a1 1 0 011 1v1M3 17v2a2 2 0 002 2h6.5M3 17H1m2 0h2m12 2h4a1 1 0 001-1v-1m-8-12v16m-4-4h8" /></svg>; }
function IconService() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>; }
