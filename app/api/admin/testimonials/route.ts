import { NextResponse } from "next/server";
import { getTestimonials, saveTestimonial, generateId, type Testimonial } from "@/lib/data";

export async function GET() {
  return NextResponse.json(getTestimonials());
}

export async function POST(request: Request) {
  const body = await request.json();
  const testimonial: Testimonial = {
    _id: generateId(),
    clientName: body.clientName,
    quote: body.quote,
    avatar: body.avatar || null,
    projectTitle: body.projectTitle || "",
    projectSlug: body.projectSlug || "",
  };
  saveTestimonial(testimonial);
  return NextResponse.json(testimonial, { status: 201 });
}
