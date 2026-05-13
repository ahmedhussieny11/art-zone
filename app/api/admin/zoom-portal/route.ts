import { NextResponse } from "next/server";
import { getZoomPortalConfig, saveZoomPortalConfig } from "@/lib/zoom-portal-data";

export async function GET() {
  return NextResponse.json(getZoomPortalConfig());
}

export async function PUT(request: Request) {
  const body = await request.json();
  saveZoomPortalConfig(body);
  return NextResponse.json({ success: true });
}
