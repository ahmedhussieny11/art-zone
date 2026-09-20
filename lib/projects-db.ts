import type { RowDataPacket } from "mysql2";
import type { Project } from "@/lib/data";
import {
  execute,
  fromMysqlDateTime,
  parseJsonArray,
  query,
  toMysqlDateTime,
} from "@/lib/db";

interface ProjectRow extends RowDataPacket {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  cover_image: string | null;
  concept: string | null;
  gallery: unknown;
  before_image: string | null;
  after_image: string | null;
  materials: unknown;
  featured: number | boolean;
  created_at: Date | string;
}

function rowToProject(row: ProjectRow): Project {
  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category || "",
    coverImage: row.cover_image,
    concept: row.concept || "",
    gallery: parseJsonArray(row.gallery),
    beforeImage: row.before_image,
    afterImage: row.after_image,
    materials: parseJsonArray(row.materials),
    featured: Boolean(row.featured),
    createdAt: fromMysqlDateTime(row.created_at),
  };
}

export async function listProjects(): Promise<Project[]> {
  const rows = await query<ProjectRow[]>(
    `SELECT * FROM projects ORDER BY created_at DESC`
  );
  return rows.map(rowToProject);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const rows = await query<ProjectRow[]>(
    `SELECT * FROM projects WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] ? rowToProject(rows[0]) : undefined;
}

export async function getProjectBySlugDb(slug: string): Promise<Project | undefined> {
  const decoded = decodeURIComponent(slug);
  const rows = await query<ProjectRow[]>(
    `SELECT * FROM projects WHERE slug = :slug OR slug = :decoded LIMIT 1`,
    { slug, decoded }
  );
  return rows[0] ? rowToProject(rows[0]) : undefined;
}

export async function upsertProject(project: Project): Promise<void> {
  await execute(
    `INSERT INTO projects (
      id, title, slug, category, cover_image, concept, gallery,
      before_image, after_image, materials, featured, created_at
    ) VALUES (
      :id, :title, :slug, :category, :coverImage, :concept, :gallery,
      :beforeImage, :afterImage, :materials, :featured, :createdAt
    )
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      slug = VALUES(slug),
      category = VALUES(category),
      cover_image = VALUES(cover_image),
      concept = VALUES(concept),
      gallery = VALUES(gallery),
      before_image = VALUES(before_image),
      after_image = VALUES(after_image),
      materials = VALUES(materials),
      featured = VALUES(featured)`,
    {
      id: project._id,
      title: project.title,
      slug: project.slug,
      category: project.category,
      coverImage: project.coverImage,
      concept: project.concept,
      gallery: JSON.stringify(project.gallery || []),
      beforeImage: project.beforeImage,
      afterImage: project.afterImage,
      materials: JSON.stringify(project.materials || []),
      featured: project.featured ? 1 : 0,
      createdAt: toMysqlDateTime(project.createdAt),
    }
  );
}

export async function removeProject(id: string): Promise<void> {
  await execute(`DELETE FROM projects WHERE id = :id`, { id });
}
