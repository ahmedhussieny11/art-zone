import { NextResponse } from "next/server";
import { getArticles, saveArticle, generateId, type Article } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getArticles());
}

export async function POST(request: Request) {
  const body = await request.json();
  const now = new Date().toISOString();
  const article: Article = {
    _id: generateId(),
    title: body.title,
    slug: body.slug || body.title.replace(/\s+/g, "-").toLowerCase(),
    excerpt: body.excerpt || "",
    content: body.content || "",
    coverImage: body.coverImage || null,
    category: body.category || "",
    tags: body.tags || [],
    author: body.author || "فريق آرت زون",
    published: body.published || false,
    showOnHome: body.showOnHome === true,
    seoTitle: body.seoTitle || body.title,
    seoDescription: body.seoDescription || body.excerpt || "",
    seoKeywords: body.seoKeywords || [],
    ogImage: body.ogImage || body.coverImage || null,
    createdAt: now,
    updatedAt: now,
  };
  saveArticle(article);
  return NextResponse.json(article, { status: 201 });
}
