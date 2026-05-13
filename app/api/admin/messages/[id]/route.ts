import { NextResponse } from "next/server";
import { getMessage, saveMessage, deleteMessage } from "@/lib/data";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = getMessage(id);
  if (!existing) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  const body = await request.json();
  saveMessage({ ...existing, ...body, _id: id });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteMessage(id);
  return NextResponse.json({ success: true });
}
