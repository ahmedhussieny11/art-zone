"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Article } from "@/lib/data";
import { SingleImageUploader } from "@/components/admin/ImageUploader";
import RichEditor from "@/components/admin/RichEditor";
import CategorySelect from "@/components/admin/CategorySelect";
import TagInput from "@/components/admin/TagInput";
import { ADMIN_UI_BASE } from "@/lib/admin-path";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  const [showOnHome, setShowOnHome] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then((r) => r.json())
      .then((a: Article) => {
        setArticle(a);
        setPublished(a.published);
        setShowOnHome(a.showOnHome === true);
        setCoverImage(a.coverImage);
        setOgImage(a.ogImage);
        setContent(a.content || "");
        setTags(a.tags || []);
        setSeoKeywords(a.seoKeywords || []);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title"),
      slug: fd.get("slug"),
      excerpt: fd.get("excerpt"),
      content,
      coverImage,
      category: fd.get("category"),
      tags,
      author: fd.get("author"),
      published,
      showOnHome,
      seoTitle: fd.get("seoTitle") || fd.get("title"),
      seoDescription: fd.get("seoDescription") || fd.get("excerpt"),
      seoKeywords,
      ogImage: ogImage || coverImage,
    };
    await fetch(`/api/admin/articles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    router.push(`${ADMIN_UI_BASE}/articles`);
  }

  if (!article) return <div className="text-warmgray">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal">تعديل: {article.title}</h1>

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
                <input name="title" required defaultValue={article.title} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-charcoal">الرابط (Slug)</label>
                <input name="slug" dir="ltr" defaultValue={article.slug} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">المقتطف / الوصف القصير *</label>
              <textarea name="excerpt" rows={2} required defaultValue={article.excerpt} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
            </div>

            <SingleImageUploader label="صورة الغلاف" value={coverImage} onChange={setCoverImage} />

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">محتوى المقال *</label>
              <RichEditor value={content} onChange={setContent} />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <CategorySelect name="category" label="التصنيف" type="article" defaultValue={article.category} />
              <div>
                <label className="mb-2 block text-xs font-medium text-charcoal">الكاتب</label>
                <input name="author" defaultValue={article.author} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
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
                <p className="text-xs text-warmgray">يظهر في قسم المدونة بالهوم (للمقالات المنشورة فقط)</p>
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
              <input name="seoTitle" defaultValue={article.seoTitle} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-charcoal">وصف SEO (Meta Description)</label>
              <textarea name="seoDescription" rows={3} defaultValue={article.seoDescription} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gold" />
            </div>

            <TagInput label="الكلمات المفتاحية" value={seoKeywords} onChange={setSeoKeywords} placeholder="اكتب الكلمة ثم اضغط Enter" />

            <SingleImageUploader label="صورة Open Graph (للمشاركة على السوشيال ميديا)" value={ogImage} onChange={setOgImage} />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
          <Link href={`/blog/${article.slug}`} target="_blank" className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-warmgray hover:bg-gray-50">
            معاينة
          </Link>
          <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-warmgray hover:bg-gray-50">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
