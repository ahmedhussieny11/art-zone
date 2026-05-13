"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SingleImageUploader, GalleryUploader } from "@/components/admin/ImageUploader";
import CategorySelect from "@/components/admin/CategorySelect";
import { generateSlug } from "@/lib/slug";

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugTouched) setSlug(generateSlug(val));
  }

  function handleSlugChange(val: string) {
    setSlugTouched(true);
    setSlug(generateSlug(val));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      title,
      slug: slug || generateSlug(title),
      category: fd.get("category"),
      concept: fd.get("concept"),
      materials: (fd.get("materials") as string).split("،").map((m) => m.trim()).filter(Boolean),
      featured: fd.get("featured") === "on",
      coverImage,
      gallery,
      beforeImage,
      afterImage,
    };
    await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.push("/admin/projects");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">مشروع جديد</h1>
      <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-6 rounded-xl bg-white p-8 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">اسم المشروع *</label>
            <input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-charcoal">الرابط (Slug)</label>
            <input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              dir="ltr"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold"
              placeholder="يتم إنشاؤه تلقائياً من الاسم"
            />
            <p className="mt-1 text-[10px] text-warmgray">يدعم العربي والإنجليزي - يتم إنشاؤه تلقائياً من الاسم</p>
          </div>
        </div>

        <CategorySelect name="category" label="التصنيف *" required type="project" />

        <div>
          <label className="mb-2 block text-xs font-medium text-charcoal">الفكرة / الوصف</label>
          <textarea name="concept" rows={4} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
        </div>

        <SingleImageUploader label="صورة الغلاف" value={coverImage} onChange={setCoverImage} />

        <GalleryUploader label="معرض الصور" value={gallery} onChange={setGallery} />

        <div className="grid gap-6 sm:grid-cols-2">
          <SingleImageUploader label="صورة قبل" value={beforeImage} onChange={setBeforeImage} />
          <SingleImageUploader label="صورة بعد" value={afterImage} onChange={setAfterImage} />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-charcoal">المواد (مفصولة بفاصلة ،)</label>
          <input name="materials" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" placeholder="رخام إيطالي، خشب بلوط، نحاس" />
        </div>

        <label className="flex items-center gap-3">
          <input type="checkbox" name="featured" className="h-4 w-4 accent-gold" />
          <span className="text-sm text-charcoal">مشروع مميز (يظهر في الصفحة الرئيسية)</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ المشروع"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-warmgray hover:bg-gray-50">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
