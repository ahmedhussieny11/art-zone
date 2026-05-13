import { NextResponse } from "next/server";
import { getProjects, saveProject, generateId, type Project } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getProjects());
}

export async function POST(request: Request) {
  const body = await request.json();
  const project: Project = {
    _id: generateId(),
    title: body.title,
    slug: body.slug || body.title.replace(/\s+/g, "-").toLowerCase(),
    category: body.category,
    coverImage: body.coverImage || null,
    concept: body.concept || "",
    gallery: body.gallery || [],
    beforeImage: body.beforeImage || null,
    afterImage: body.afterImage || null,
    materials: body.materials || [],
    featured: body.featured || false,
    createdAt: new Date().toISOString(),
  };
  saveProject(project);
  return NextResponse.json(project, { status: 201 });
}
