import { NextRequest, NextResponse } from "next/server";

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

  // TODO: query database for existing article by originalUrl
  return NextResponse.json({ exists: false, originalUrl });
}
