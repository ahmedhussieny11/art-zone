import { NextResponse } from "next/server";

/** للتحقق أن خادم Node يعمل (من hPanel أو curl) — لا يعتمد على قاعدة بيانات أو ملفات إعدادات ثقيلة. */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ ok: true, service: "next", time: new Date().toISOString() });
}
