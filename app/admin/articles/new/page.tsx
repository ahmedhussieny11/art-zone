"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SingleImageUploader } from "@/components/admin/ImageUploader";
import RichEditor from "@/components/admin/RichEditor";
import CategorySelect from "@/components/admin/CategorySelect";
import TagInput from "@/components/admin/TagInput";
import { generateSlug } from "@/lib/slug";

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [showOnHome, setShowOnHome] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
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
      excerpt: fd.get("excerpt"),
      content,
      coverImage,
      category: fd.get("category"),
      tags,
      author: fd.get("author"),
      published,
      showOnHome,
      seoTitle: fd.get("seoTitle") || title,
      seoDescription: fd.get("seoDescription") || fd.get("excerpt"),
      seoKeywords,
      ogImage: ogImage || coverImage,
    };
    await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.push("/admin/articles");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">مقال جديد</h1>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveTab("content")} className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "content" ? "border-b-2 border-gold text-gold" : "text-warmgray hover:text-charcoal"}`}>
          المحتوى
        </button>
        <button onClick={() => setActiveTab("seo")} className={`px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === "seo" ? "border-b-2 border-gold text-gold" : "text-warmgray hover:text-charcoal"}`}>
          إعدادات SEO
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 max-w-4xl">
        <div className={activeTab === "content" ? "block" : "hidden"}>
          <div className="space-y-6 rounded-xl bg-white p-8 shadow-sm">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-charcoal">عنوان المقال *</label>
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
                  placeholder="يتم إنشاؤه تلقائياً من العنوان"
                />
                <p className="mt-1 text-[10px] text-warmgray">يدعم العربي والإنجليزي - يتم إنشاؤه تلقائياً من العنوان</p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">المقتطف / الوصف القصير *</label>
              <textarea name="excerpt" rows={2} required className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" placeholder="وصف مختصر يظهر في قائمة المقالات ونتائج البحث..." />
            </div>

            <SingleImageUploader label="صورة الغلاف" value={coverImage} onChange={setCoverImage} />

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">محتوى المقال *</label>
              <RichEditor value={content} onChange={setContent} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <CategorySelect name="category" label="التصنيف" type="article" />
              <div>
                <label className="mb-2 block text-xs font-medium text-charcoal">الكاتب</label>
                <input name="author" defaultValue="فريق آرت زون" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
            </div>

            <TagInput label="الوسوم (Tags)" value={tags} onChange={setTags} placeholder="اكتب الوسم ثم اضغط Enter" />

            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <span className="text-sm font-medium text-charcoal">نشر المقال</span>
                <p className="text-xs text-warmgray">المقالات المنشورة تظهر في المدونة ومحركات البحث</p>
              </div>
              <button type="button" onClick={() => setPublished(!published)} className={`relative h-7 w-12 rounded-full transition-colors ${published ? "bg-green-500" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${published ? "right-0.5" : "right-[22px]"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gold/20 bg-gold/5 px-4 py-3">
              <div>
                <span className="text-sm font-medium text-charcoal">عرض في الصفحة الرئيسية</span>
                <p className="text-xs text-warmgray">يظهر في قسم المدونة بالهوم مع المقالات المختارة (حسب الإعدادات في «أقسام الصفحة»)</p>
              </div>
              <button type="button" onClick={() => setShowOnHome(!showOnHome)} className={`relative h-7 w-12 rounded-full transition-colors ${showOnHome ? "bg-gold" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${showOnHome ? "right-0.5" : "right-[22px]"}`} />
              </button>
            </div>
          </div>
        </div>

        <div className={activeTab === "seo" ? "block" : "hidden"}>
          <div className="space-y-6 rounded-xl bg-white p-8 shadow-sm">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-700">إعدادات SEO تساعد مقالاتك تظهر بشكل أفضل في نتائج محركات البحث مثل Google</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">عنوان SEO (Title Tag)</label>
              <input name="seoTitle" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" placeholder="يظهر في تبويب المتصفح ونتائج البحث (50-60 حرف)" />
              <p className="mt-1 text-xs text-warmgray">لو فاضي هيستخدم عنوان المقال تلقائياً</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">وصف SEO (Meta Description)</label>
              <textarea name="seoDescription" rows={3} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" placeholder="الوصف اللي يظهر تحت العنوان في نتائج البحث (150-160 حرف)" />
              <p className="mt-1 text-xs text-warmgray">لو فاضي هيستخدم المقتطف تلقائياً</p>
            </div>

            <TagInput label="الكلمات المفتاحية" value={seoKeywords} onChange={setSeoKeywords} placeholder="اكتب الكلمة ثم اضغط Enter" />

            <SingleImageUploader label="صورة Open Graph (للمشاركة على السوشيال ميديا)" value={ogImage} onChange={setOgImage} />
            <p className="text-xs text-warmgray">لو فاضية هتستخدم صورة الغلاف تلقائياً. الحجم المثالي: 1200×630 بيكسل</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50">
            {saving ? "جاري الحفظ..." : published ? "نشر المقال" : "حفظ كمسودة"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-warmgray hover:bg-gray-50">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
