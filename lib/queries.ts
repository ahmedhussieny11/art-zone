import { client } from "@/sanity/client";

export async function getFeaturedProjects() {
  return client.fetch(
    `*[_type == "project" && featured == true] | order(order asc) [0...3] {
      _id, title, slug, category, coverImage, concept
    }`
  );
}

export async function getAllProjects(category?: string) {
  const filter = category
    ? `*[_type == "project" && category == $category]`
    : `*[_type == "project"]`;
  return client.fetch(
    `${filter} | order(order asc) {
      _id, title, slug, category, coverImage
    }`,
    category ? { category } : {}
  );
}

export async function getProjectBySlug(slug: string) {
  return client.fetch(
    `*[_type == "project" && slug.current == $slug][0] {
      _id, title, slug, category, coverImage, concept,
      gallery, beforeImage, afterImage, materials, featured
    }`,
    { slug }
  );
}

export async function getRelatedProjects(category: string, excludeId: string) {
  return client.fetch(
    `*[_type == "project" && category == $category && _id != $excludeId] | order(order asc) [0...3] {
      _id, title, slug, category, coverImage
    }`,
    { category, excludeId }
  );
}

export async function getAllProjectSlugs() {
  return client.fetch(
    `*[_type == "project"] { "slug": slug.current }`
  );
}

export async function getTestimonials() {
  return client.fetch(
    `*[_type == "testimonial"] {
      _id, clientName, quote, avatar,
      project->{ title, slug }
    }`
  );
}

export async function getServices() {
  return client.fetch(
    `*[_type == "service"] | order(order asc) {
      _id, title, description, icon
    }`
  );
}
