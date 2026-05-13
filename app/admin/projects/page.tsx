"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Project } from "@/lib/data";

const categoryLabels: Record<string, string> = { residential: "سكني", commercial: "تجاري", classic: "كلاسيكي", modern: "عصري" };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/projects").then((r) => r.json()).then((d) => { setProjects(d); setLoading(false); });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p._id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">المشاريع</h1>
          <p className="mt-1 text-sm text-warmgray">إدارة مشاريع المعرض</p>
        </div>
        <Link href="/admin/projects/new" className="rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark">
          + مشروع جديد
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 text-center text-warmgray">جاري التحميل...</div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3.5 text-start text-xs font-medium text-warmgray">المشروع</th>
                <th className="px-6 py-3.5 text-start text-xs font-medium text-warmgray">التصنيف</th>
                <th className="px-6 py-3.5 text-start text-xs font-medium text-warmgray">مميز</th>
                <th className="px-6 py-3.5 text-start text-xs font-medium text-warmgray">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-charcoal">{project.title}</p>
                    <p className="mt-0.5 text-xs text-warmgray">{project.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-charcoal">
                      {categoryLabels[project.category] || project.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs ${project.featured ? "text-gold" : "text-warmgray"}`}>
                      {project.featured ? "نعم" : "لا"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/projects/${project._id}`} className="text-xs text-gold hover:text-gold-dark">
                        تعديل
                      </Link>
                      <button onClick={() => handleDelete(project._id)} className="text-xs text-red-500 hover:text-red-700">
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
