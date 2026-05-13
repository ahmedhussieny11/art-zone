import { NextResponse } from "next/server";
import { getServices, saveService, generateId, type Service } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getServices());
}

export async function POST(request: Request) {
  const body = await request.json();
  const service: Service = {
    _id: generateId(),
    title: body.title,
    description: body.description,
    icon: body.icon || "interior",
    order: body.order || getServices().length + 1,
  };
  saveService(service);
  return NextResponse.json(service, { status: 201 });
}
