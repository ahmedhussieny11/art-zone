"use client";

import { useState, useEffect } from "react";
import type { Message } from "@/lib/data";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/messages").then((r) => r.json()).then((d) => { setMessages(d); setLoading(false); });
  }, []);

  async function markAsRead(msg: Message) {
    setSelected(msg);
    if (!msg.read) {
      await fetch(`/api/admin/messages/${msg._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: true }) });
      setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, read: true } : m));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selected?._id === id) setSelected(null);
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">الرسائل</h1>
      <p className="mt-1 text-sm text-warmgray">
        {messages.length} رسالة {unreadCount > 0 && `(${unreadCount} غير مقروءة)`}
      </p>

      {loading ? (
        <div className="mt-8 text-center text-warmgray">جاري التحميل...</div>
      ) : messages.length === 0 ? (
        <div className="mt-8 rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-lg text-warmgray">لا توجد رسائل حتى الآن</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* Messages list */}
          <div className="space-y-2 lg:col-span-2">
            {messages.map((msg) => (
              <button
                key={msg._id}
                onClick={() => markAsRead(msg)}
                className={`w-full rounded-xl p-4 text-start transition-colors ${
                  selected?._id === msg._id ? "bg-gold/10 ring-1 ring-gold/30" : "bg-white hover:bg-gray-50"
                } shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${!msg.read ? "font-bold text-charcoal" : "text-charcoal"}`}>{msg.name}</span>
                  {!msg.read && <span className="h-2 w-2 rounded-full bg-gold" />}
                </div>
                <p className="mt-1 text-xs text-warmgray">{msg.service}</p>
                <p className="mt-1 truncate text-xs text-warmgray/70">{msg.message}</p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="rounded-xl bg-white p-8 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-charcoal">{selected.name}</h2>
                    <p className="mt-1 text-sm text-warmgray">
                      {new Date(selected.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(selected._id)} className="text-xs text-red-500 hover:text-red-700">حذف</button>
                </div>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div><span className="text-xs text-warmgray">الجوال</span><p dir="ltr" className="mt-1 text-charcoal">{selected.phone}</p></div>
                    <div><span className="text-xs text-warmgray">البريد</span><p dir="ltr" className="mt-1 text-charcoal">{selected.email || "غير محدد"}</p></div>
                    <div><span className="text-xs text-warmgray">الخدمة</span><p className="mt-1 text-charcoal">{selected.service}</p></div>
                    <div><span className="text-xs text-warmgray">الميزانية</span><p className="mt-1 text-charcoal">{selected.budget || "غير محددة"}</p></div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <span className="text-xs text-warmgray">الرسالة</span>
                    <p className="mt-2 leading-relaxed text-charcoal">{selected.message}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-xl bg-white shadow-sm">
                <p className="text-warmgray">اختر رسالة لعرض تفاصيلها</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
