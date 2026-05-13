"use client";

import { useState, useEffect, useRef } from "react";

interface Category {
  value: string;
  label: string;
}

interface Props {
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  type: "project" | "article";
}

export default function CategorySelect({ name, label, required, defaultValue, type }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState(defaultValue || "");
  const [adding, setAdding] = useState(false);
  const [managing, setManaging] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const manageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((s) => {
        const cats = type === "project" ? s.projectCategories : s.articleCategories;
        if (cats?.length) setCategories(cats);
      })
      .catch(() => {});
  }, [type]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (manageRef.current && !manageRef.current.contains(e.target as Node)) {
        setManaging(false);
      }
    }
    if (managing) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [managing]);

  async function saveCategories(updated: Category[]) {
    const res = await fetch("/api/admin/settings");
    const settings = await res.json();
    const key = type === "project" ? "projectCategories" : "articleCategories";
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, [key]: updated }),
    });
  }

  async function addCategory() {
    if (!newLabel.trim()) return;
    const value = newLabel.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\u0600-\u06FFa-z0-9-]/g, "");
    const newCat = { value: value || `cat-${Date.now()}`, label: newLabel.trim() };
    const updated = [...categories, newCat];
    setCategories(updated);
    setSelected(type === "article" ? newCat.label : newCat.value);
    await saveCategories(updated);
    setNewLabel("");
    setAdding(false);
  }

  async function deleteCategory(catToDelete: Category) {
    const updated = categories.filter((c) => c.value !== catToDelete.value);
    setCategories(updated);
    const selectedVal = type === "article" ? catToDelete.label : catToDelete.value;
    if (selected === selectedVal) setSelected("");
    await saveCategories(updated);
  }

  return (
    <div className="relative">
      <label className="mb-2 block text-xs font-medium text-charcoal">{label}</label>
      <input type="hidden" name={name} value={selected} />

      {!adding ? (
        <div className="flex gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            required={required}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
          >
            <option value="">اختر التصنيف</option>
            {categories.map((c) => (
              <option key={c.value} value={type === "article" ? c.label : c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="shrink-0 rounded-lg border border-gold/30 px-3 text-gold transition-colors hover:bg-gold/5"
            title="إضافة تصنيف جديد"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setManaging(!managing)}
            className="shrink-0 rounded-lg border border-red-200 px-3 text-red-400 transition-colors hover:bg-red-50"
            title="إدارة التصنيفات"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="اسم التصنيف الجديد"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategory(); } }}
          />
          <button
            type="button"
            onClick={addCategory}
            className="shrink-0 rounded-lg bg-gold px-4 py-2 text-sm text-white hover:bg-gold-dark"
          >
            أضف
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setNewLabel(""); }}
            className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-sm text-warmgray hover:bg-gray-50"
          >
            إلغاء
          </button>
        </div>
      )}

      {managing && (
        <div ref={manageRef} className="absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <p className="mb-3 text-xs font-semibold text-charcoal">إدارة التصنيفات</p>
          {categories.length === 0 ? (
            <p className="py-3 text-center text-xs text-warmgray">لا توجد تصنيفات</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.value} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                  <span className="text-sm text-charcoal">{c.label}</span>
                  <button
                    type="button"
                    onClick={() => deleteCategory(c)}
                    className="rounded p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    title="حذف التصنيف"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => setManaging(false)}
            className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-xs text-warmgray transition-colors hover:bg-gray-50"
          >
            إغلاق
          </button>
        </div>
      )}
    </div>
  );
}
