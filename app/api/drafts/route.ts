import { NextRequest, NextResponse } from "next/server";
import {
  generateId,
  getArticleByOriginalUrl,
  saveArticle,
  type Article,
} from "@/lib/data";

/** n8n: duplicate-check (GET) + create draft articles (POST). */
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  return Boolean(apiKey && apiKey === process.env.N8N_API_KEY);
}

function slugify(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || `draft-${Date.now()}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  const originalUrl = request.nextUrl.searchParams.get("originalUrl");
  if (!originalUrl) {
    return NextResponse.json({ error: "originalUrl is required" }, { status: 400 });
  }

  const article = await getArticleByOriginalUrl(originalUrl);
  if (!article) {
    return NextResponse.json({ exists: false, originalUrl });
  }

  return NextResponse.json({
    exists: true,
    originalUrl,
    id: article._id,
    slug: article.slug,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const originalUrl =
    typeof body.originalUrl === "string" ? body.originalUrl.trim() : "";

  if (!title || !originalUrl) {
    return NextResponse.json(
      { error: "title and originalUrl are required" },
      { status: 400 }
    );
  }

  const existing = await getArticleByOriginalUrl(originalUrl);
  if (existing) {
    return NextResponse.json(
      {
        exists: true,
        originalUrl,
        id: existing._id,
        slug: existing.slug,
      },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const slug =
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim()
      : slugify(title);

  const article: Article = {
    _id: generateId(),
    title,
    slug,
    excerpt: typeof body.excerpt === "string" ? body.excerpt : "",
    content: typeof body.content === "string" ? body.content : "",
    coverImage: typeof body.coverImage === "string" ? body.coverImage : null,
    category: typeof body.category === "string" ? body.category : "",
    tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
    author: typeof body.author === "string" && body.author ? body.author : "فريق آرت زون",
    published: false,
    showOnHome: false,
    seoTitle: typeof body.seoTitle === "string" && body.seoTitle ? body.seoTitle : title,
    seoDescription:
      typeof body.seoDescription === "string"
        ? body.seoDescription
        : typeof body.excerpt === "string"
          ? body.excerpt
          : "",
    seoKeywords: Array.isArray(body.seoKeywords) ? body.seoKeywords.map(String) : [],
    ogImage:
      typeof body.ogImage === "string"
        ? body.ogImage
        : typeof body.coverImage === "string"
          ? body.coverImage
          : null,
    originalUrl,
    createdAt: now,
    updatedAt: now,
  };

  await saveArticle(article);
  return NextResponse.json(article, { status: 201 });
}
