"use client";

import { useState, useEffect } from "react";
import type { Service } from "@/lib/data";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/services").then((r) => r.json()).then((d) => { setServices(d); setLoading(false); });
  }, []);

  async function handleSave(id: string, form: FormData) {
    const data = { title: form.get("title"), description: form.get("description"), icon: form.get("icon") };
    await fetch(`/api/admin/services/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setServices((prev) => prev.map((s) => s._id === id ? { ...s, ...data } as Service : s));
    setEditing(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    setServices((prev) => prev.filter((s) => s._id !== id));
  }

  async function handleAdd(form: FormData) {
    const data = { title: form.get("title"), description: form.get("description"), icon: form.get("icon") || "interior" };
    const res = await fetch("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const newService = await res.json();
    setServices((prev) => [...prev, newService]);
    setEditing(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">الخدمات</h1>
          <p className="mt-1 text-sm text-warmgray">إدارة الخدمات المعروضة في الموقع</p>
        </div>
        <button onClick={() => setEditing("new")} className="rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-dark">
          + خدمة جديدة
        </button>
      </div>

      {loading ? (
        <div className="mt-8 text-center text-warmgray">جاري التحميل...</div>
      ) : (
        <div className="mt-8 space-y-4">
          {editing === "new" && (
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(new FormData(e.currentTarget)); }} className="rounded-xl bg-white p-6 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <input name="title" required placeholder="اسم الخدمة" className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
                <select name="icon" className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold">
                  <option value="interior">تصميم داخلي</option>
                  <option value="fitout">تشطيبات</option>
                  <option value="supervision">إشراف</option>
                </select>
              </div>
              <textarea name="description" required placeholder="وصف الخدمة" rows={3} className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
              <div className="mt-4 flex gap-3">
                <button type="submit" className="rounded-lg bg-gold px-5 py-2 text-sm text-white hover:bg-gold-dark">حفظ</button>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-warmgray">إلغاء</button>
              </div>
            </form>
          )}

          {services.map((service) => (
            <div key={service._id} className="rounded-xl bg-white p-6 shadow-sm">
              {editing === service._id ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSave(service._id, new FormData(e.currentTarget)); }}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input name="title" defaultValue={service.title} className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
                    <select name="icon" defaultValue={service.icon} className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold">
                      <option value="interior">تصميم داخلي</option>
                      <option value="fitout">تشطيبات</option>
                      <option value="supervision">إشراف</option>
                    </select>
                  </div>
                  <textarea name="description" defaultValue={service.description} rows={3} className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
                  <div className="mt-4 flex gap-3">
                    <button type="submit" className="rounded-lg bg-gold px-5 py-2 text-sm text-white hover:bg-gold-dark">حفظ</button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-warmgray">إلغاء</button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-charcoal">{service.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-warmgray">{service.description}</p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => setEditing(service._id)} className="text-xs text-gold hover:text-gold-dark">تعديل</button>
                    <button onClick={() => handleDelete(service._id)} className="text-xs text-red-500 hover:text-red-700">حذف</button>
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
