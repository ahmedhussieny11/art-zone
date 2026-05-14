import { NextResponse } from "next/server";
import {
  getVideoScrollConfig,
  saveVideoScrollConfig,
} from "@/lib/video-scroll-data";

export async function GET() {
  return NextResponse.json(getVideoScrollConfig());
}

export async function PUT(request: Request) {
  const body = await request.json();
  saveVideoScrollConfig(body);
  return NextResponse.json({ success: true });
}
