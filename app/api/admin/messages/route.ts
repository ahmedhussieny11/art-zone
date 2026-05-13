import { NextResponse } from "next/server";
import { getMessages } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getMessages());
}
