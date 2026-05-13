import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const settings = getSettings();
  return NextResponse.json(settings, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
