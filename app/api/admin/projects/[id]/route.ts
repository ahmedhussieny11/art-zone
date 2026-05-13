import { NextResponse } from "next/server";
import { getProject, saveProject, deleteProject } from "@/lib/data";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = getProject(id);
  if (!existing) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const body = await request.json();
  const updated = { ...existing, ...body, _id: id };
  saveProject(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteProject(id);
  return NextResponse.json({ success: true });
}
