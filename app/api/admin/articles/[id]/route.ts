import { NextResponse } from "next/server";
import { getArticle, saveArticle, deleteArticle } from "@/lib/data";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = getArticle(id);
  if (!existing) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const body = await request.json();
  const updated = { ...existing, ...body, _id: id, updatedAt: new Date().toISOString() };
  saveArticle(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteArticle(id);
  return NextResponse.json({ success: true });
}
