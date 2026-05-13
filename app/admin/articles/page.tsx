"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Article } from "@/lib/data";

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/admin/articles").then((r) => r.json()).then(setArticles);
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    setArticles((prev) => prev.filter((a) => a._id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">المقالات</h1>
          <p className="mt-1 text-sm text-warmgray">إدارة مقالات المدونة</p>
        </div>
        <Link href="/admin/articles/new" className="rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-dark">
          + مقال جديد
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-start text-xs font-medium text-warmgray">العنوان</th>
              <th className="px-6 py-4 text-start text-xs font-medium text-warmgray">التصنيف</th>
              <th className="px-6 py-4 text-start text-xs font-medium text-warmgray">الحالة</th>
              <th className="px-6 py-4 text-start text-xs font-medium text-warmgray">التاريخ</th>
              <th className="px-6 py-4 text-start text-xs font-medium text-warmgray">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article._id} className="border-b border-gray-50 last:border-0">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-charcoal">{article.title}</p>
                    <p className="mt-0.5 text-xs text-warmgray" dir="ltr">/blog/{article.slug}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-warmgray">{article.category}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs ${article.published ? "bg-green-50 text-green-600" : "bg-gray-100 text-warmgray"}`}>
                    {article.published ? "منشور" : "مسودة"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-warmgray">
                  {new Date(article.createdAt).toLocaleDateString("ar-SA")}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/blog/${article.slug}`} target="_blank" className="text-warmgray transition-colors hover:text-gold" title="معاينة">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link href={`/admin/articles/${article._id}`} className="text-xs text-gold hover:text-gold-dark">تعديل</Link>
                    <button onClick={() => handleDelete(article._id)} className="text-xs text-red-500 hover:text-red-700">حذف</button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-warmgray">لا توجد مقالات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
