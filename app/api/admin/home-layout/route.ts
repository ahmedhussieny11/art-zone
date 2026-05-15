import { NextResponse } from "next/server";
import { getHomeLayoutConfig, saveHomeLayoutConfig } from "@/lib/home-layout-data";
import { normalizeHomeLayout } from "@/lib/home-layout-config";
import { getVideoScrollConfig } from "@/lib/video-scroll-data";

export async function GET() {
  const video = getVideoScrollConfig();
  return NextResponse.json(getHomeLayoutConfig(video.position));
}

export async function PUT(request: Request) {
  const body = await request.json();
  saveHomeLayoutConfig(normalizeHomeLayout(body));
  return NextResponse.json({ success: true });
}
