"use client";

import { useState, useEffect } from "react";
import type { Testimonial } from "@/lib/data";

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/testimonials").then((r) => r.json()).then((d) => { setItems(d); setLoading(false); });
  }, []);

  async function handleSave(id: string, form: FormData) {
    const data = { clientName: form.get("clientName"), quote: form.get("quote"), projectTitle: form.get("projectTitle") };
    await fetch(`/api/admin/testimonials/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setItems((prev) => prev.map((t) => t._id === id ? { ...t, ...data } as Testimonial : t));
    setEditing(null);
  }

  async function handleAdd(form: FormData) {
    const data = { clientName: form.get("clientName"), quote: form.get("quote"), projectTitle: form.get("projectTitle") || "" };
    const res = await fetch("/api/admin/testimonials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const newItem = await res.json();
    setItems((prev) => [...prev, newItem]);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الرأي؟")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((t) => t._id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">آراء العملاء</h1>
          <p className="mt-1 text-sm text-warmgray">إدارة شهادات وآراء العملاء</p>
        </div>
        <button onClick={() => setEditing("new")} className="rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-dark">
          + رأي جديد
        </button>
      </div>

      {loading ? (
        <div className="mt-8 text-center text-warmgray">جاري التحميل...</div>
      ) : (
        <div className="mt-8 space-y-4">
          {editing === "new" && (
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(new FormData(e.currentTarget)); }} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="clientName" required placeholder="اسم العميل" className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
                <input name="projectTitle" placeholder="اسم المشروع (اختياري)" className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <textarea name="quote" required placeholder="رأي العميل" rows={3} className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
              <div className="mt-4 flex gap-3">
                <button type="submit" className="rounded-lg bg-gold px-5 py-2 text-sm text-white hover:bg-gold-dark">حفظ</button>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-warmgray">إلغاء</button>
              </div>
            </form>
          )}

          {items.map((t) => (
            <div key={t._id} className="rounded-xl bg-white p-6 shadow-sm">
              {editing === t._id ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSave(t._id, new FormData(e.currentTarget)); }}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input name="clientName" defaultValue={t.clientName} className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
                    <input name="projectTitle" defaultValue={t.projectTitle} className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
                  </div>
                  <textarea name="quote" defaultValue={t.quote} rows={3} className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
                  <div className="mt-4 flex gap-3">
                    <button type="submit" className="rounded-lg bg-gold px-5 py-2 text-sm text-white hover:bg-gold-dark">حفظ</button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-warmgray">إلغاء</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-charcoal">{t.clientName}</p>
                    {t.projectTitle && <p className="mt-0.5 text-xs text-gold">{t.projectTitle}</p>}
                    <p className="mt-2 text-sm leading-relaxed text-warmgray">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => setEditing(t._id)} className="text-xs text-gold hover:text-gold-dark">تعديل</button>
                    <button onClick={() => handleDelete(t._id)} className="text-xs text-red-500 hover:text-red-700">حذف</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
