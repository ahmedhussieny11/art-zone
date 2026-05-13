"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export type ContactFormProps = {
  phonePlaceholder: string;
  serviceOptions: string[];
  budgetRanges: string[];
};

export default function ContactForm({
  phonePlaceholder,
  serviceOptions,
  budgetRanges,
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          service: formData.get("service"),
          budget: formData.get("budget"),
          message: formData.get("message"),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
          <svg
            className="h-8 w-8 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-6 font-serif text-2xl font-light text-charcoal">
          شكراً لك!
        </h3>
        <p className="mt-2 text-warmgray">
          تم استلام رسالتك وسنتواصل معك في أقرب وقت.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium tracking-widest text-gold hover:text-gold-dark"
        >
          إرسال رسالة أخرى
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-xs font-medium tracking-widest text-charcoal"
          >
            الاسم الكامل *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border border-warmgray/30 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold"
            placeholder="اسمك الكامل"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-xs font-medium tracking-widest text-charcoal"
          >
            رقم الجوال *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            dir="ltr"
            className="w-full border border-warmgray/30 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold"
            placeholder={phonePlaceholder}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-medium tracking-widest text-charcoal"
        >
          البريد الإلكتروني
        </label>
        <input
          type="email"
          id="email"
          name="email"
          dir="ltr"
          className="w-full border border-warmgray/30 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold"
          placeholder="your@email.com"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="service"
            className="mb-2 block text-xs font-medium tracking-widest text-charcoal"
          >
            نوع الخدمة *
          </label>
          <select
            id="service"
            name="service"
            required
            className="w-full border border-warmgray/30 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold"
          >
            <option value="">اختر الخدمة</option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="budget"
            className="mb-2 block text-xs font-medium tracking-widest text-charcoal"
          >
            نطاق الميزانية
          </label>
          <select
            id="budget"
            name="budget"
            className="w-full border border-warmgray/30 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold"
          >
            <option value="">اختر نطاق الميزانية</option>
            {budgetRanges.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-xs font-medium tracking-widest text-charcoal"
        >
          تفاصيل المشروع *
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full resize-none border border-warmgray/30 bg-transparent px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-gold"
          placeholder="أخبرنا عن مشروعك، المساحة، وأي متطلبات خاصة..."
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500">
          حدث خطأ ما. يرجى المحاولة مرة أخرى أو التواصل معنا عبر واتساب.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-gold px-8 py-4 text-sm font-medium tracking-widest text-white transition-all hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "جاري الإرسال..." : "إرسال الرسالة"}
      </button>
    </form>
  );
}
