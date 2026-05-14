"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/data";
import { SingleImageUploader, GalleryUploader } from "@/components/admin/ImageUploader";
import CategorySelect from "@/components/admin/CategorySelect";
import { ADMIN_UI_BASE } from "@/lib/admin-path";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/projects/${id}`)
      .then((r) => r.json())
      .then((p: Project) => {
        setProject(p);
        setCoverImage(p.coverImage);
        setGallery(p.gallery || []);
        setBeforeImage(p.beforeImage);
        setAfterImage(p.afterImage);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title"),
      slug: fd.get("slug"),
      category: fd.get("category"),
      concept: fd.get("concept"),
      materials: (fd.get("materials") as string).split("،").map((m) => m.trim()).filter(Boolean),
      featured: fd.get("featured") === "on",
      coverImage,
      gallery,
      beforeImage,
      afterImage,
    };
    await fetch(`/api/admin/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.push(`${ADMIN_UI_BASE}/projects`);
  }

  if (!project) return <div className="text-warmgray">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">تعديل: {project.title}</h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">اسم المشروع *</label>
            <input name="title" required defaultValue={project.title} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">الرابط (Slug)</label>
            <input name="slug" dir="ltr" defaultValue={project.slug} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
          </div>
        </div>

        <CategorySelect name="category" label="التصنيف *" required type="project" defaultValue={project.category} />

        <div>
          <label className="mb-2 block text-xs font-medium text-charcoal">الفكرة / الوصف</label>
          <textarea name="concept" rows={4} defaultValue={project.concept} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
        </div>

        <SingleImageUploader label="صورة الغلاف" value={coverImage} onChange={setCoverImage} />

        <GalleryUploader label="معرض الصور" value={gallery} onChange={setGallery} />

        <div className="grid gap-6 sm:grid-cols-2">
          <SingleImageUploader label="صورة قبل" value={beforeImage} onChange={setBeforeImage} />
          <SingleImageUploader label="صورة بعد" value={afterImage} onChange={setAfterImage} />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-charcoal">المواد (مفصولة بفاصلة ،)</label>
          <input name="materials" defaultValue={project.materials?.join("، ")} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
        </div>

        <label className="flex items-center gap-3">
          <input type="checkbox" name="featured" defaultChecked={project.featured} className="h-4 w-4 accent-gold" />
          <span className="text-sm text-charcoal">مشروع مميز</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-warmgray hover:bg-gray-50">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
