import { NextRequest, NextResponse } from "next/server";
import { getArticleByOriginalUrl } from "@/lib/data";

/** n8n duplicate-check for articles by originalUrl. */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
