"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HOME_SECTION_LABELS,
  type HomeLayoutConfig,
  type HomeLayoutSection,
  type HomeSectionId,
} from "@/lib/home-layout-config";
import { ADMIN_UI_BASE } from "@/lib/admin-path";

export default function HomeLayoutAdminPage() {
  const [layout, setLayout] = useState<HomeLayoutConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/home-layout")
      .then((r) => r.json())
      .then((data: HomeLayoutConfig) => setLayout(data))
      .catch(() => setLayout(null));
  }, []);

  function updateSection(index: number, patch: Partial<HomeLayoutSection>) {
    setLayout((prev) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], ...patch };
      return { sections };
    });
  }

  function move(index: number, dir: -1 | 1) {
    setLayout((prev) => {
      if (!prev) return prev;
      const next = index + dir;
      if (next < 0 || next >= prev.sections.length) return prev;
      const sections = [...prev.sections];
      [sections[index], sections[next]] = [sections[next], sections[index]];
      return { sections };
    });
  }

  async function save() {
    if (!layout) return;
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/home-layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } finally {
      setSaving(false);
    }
  }

  if (!layout) return <div className="text-warmgray">جاري التحميل...</div>;

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">ترتيب الصفحة الرئيسية</h1>
          <p className="mt-1 text-sm text-warmgray">
            رتّب كل الأقسام من فوق لتحت، وفعّل أو أخفِ أي قسم على الصفحة الرئيسية
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">✓ تم الحفظ</span>}
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ الترتيب"}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-charcoal">
          <span>📍</span>
          ترتيب الأقسام وإظهارها
        </h2>
        <p className="mb-5 text-xs text-warmgray">
          القسم الأول في القائمة يظهر أعلى الصفحة. استخدم الأسهم لتغيير الموضع.
        </p>

        <ul className="space-y-2">
          {layout.sections.map((section, index) => (
            <li
              key={section.id}
              className={`flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                section.enabled
                  ? "border-gray-200 bg-white"
                  : "border-gray-100 bg-gray-50 opacity-75"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-charcoal/5 text-xs font-bold text-charcoal">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium text-charcoal">
                {HOME_SECTION_LABELS[section.id as HomeSectionId]}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-charcoal hover:border-gold/50 disabled:opacity-30"
                  aria-label="تحريك لأعلى"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === layout.sections.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-charcoal hover:border-gold/50 disabled:opacity-30"
                  aria-label="تحريك لأسفل"
                >
                  ↓
                </button>
              </div>

              <Toggle
                enabled={section.enabled}
                onToggle={() => updateSection(index, { enabled: !section.enabled })}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-warmgray">
        <p>
          محتوى كل قسم (نصوص، صور، إطارات السكروب…) يُعدّل من صفحاته في القائمة الجانبية — مثل{" "}
          <Link href={`${ADMIN_UI_BASE}/sections`} className="text-gold hover:underline">
            أقسام الصفحة
          </Link>
          ،{" "}
          <Link href={`${ADMIN_UI_BASE}/video-scroll`} className="text-gold hover:underline">
            سكروب الإطارات
          </Link>
          ، وغيرها.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-gold px-8 py-3 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : "حفظ الترتيب"}
        </button>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-gold hover:underline"
        >
          معاينة الصفحة الرئيسية ↗
        </a>
      </div>
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
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        enabled ? "bg-green-500" : "bg-gray-300"
      }`}
      aria-label={enabled ? "إخفاء القسم" : "إظهار القسم"}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
          enabled ? "right-0.5" : "right-[22px]"
        }`}
      />
    </button>
  );
}
