import { NextResponse } from "next/server";
import { getBrandSliderConfig, saveBrandSliderConfig, type BrandSliderConfig } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getBrandSliderConfig());
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as BrandSliderConfig;
    saveBrandSliderConfig(body);
    return NextResponse.json({ success: true, config: getBrandSliderConfig() });
  } catch {
    return NextResponse.json({ error: "فشل الحفظ" }, { status: 500 });
  }
}
