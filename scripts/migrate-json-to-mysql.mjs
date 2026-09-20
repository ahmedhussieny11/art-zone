/**
 * One-time migration: data/articles.json + data/projects.json → Hostinger MySQL.
 *
 * Usage (from project root, with MYSQL_* env set):
 *   node scripts/migrate-json-to-mysql.mjs
 *
 * On Windows PowerShell you can set env inline, or use a .env.local loader.
 * This script reads process.env only (set vars in the shell or hosting panel).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function readJson(filename, fallback) {
  const filePath = path.join(root, "data", filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath} — using empty list`);
    return fallback;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function toMysqlDateTime(iso) {
  const d = new Date(iso || Date.now());
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 23).replace("T", " ");
  }
  return d.toISOString().slice(0, 23).replace("T", " ");
}

async function main() {
  const pool = mysql.createPool({
    host: requireEnv("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT || "3306"),
    user: requireEnv("MYSQL_USER"),
    password: requireEnv("MYSQL_PASSWORD"),
    database: requireEnv("MYSQL_DATABASE"),
    waitForConnections: true,
    connectionLimit: 5,
  });

  const articles = readJson("articles.json", []);
  const projects = readJson("projects.json", []);

  console.log(`Migrating ${articles.length} articles, ${projects.length} projects…`);

  for (const a of articles) {
    await pool.execute(
      `INSERT INTO articles (
        id, title, slug, excerpt, content, cover_image, category, tags, author,
        published, show_on_home, seo_title, seo_description, seo_keywords, og_image,
        original_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        slug = VALUES(slug),
        excerpt = VALUES(excerpt),
        content = VALUES(content),
        cover_image = VALUES(cover_image),
        category = VALUES(category),
        tags = VALUES(tags),
        author = VALUES(author),
        published = VALUES(published),
        show_on_home = VALUES(show_on_home),
        seo_title = VALUES(seo_title),
        seo_description = VALUES(seo_description),
        seo_keywords = VALUES(seo_keywords),
        og_image = VALUES(og_image),
        original_url = VALUES(original_url),
        updated_at = VALUES(updated_at)`,
      [
        a._id,
        a.title,
        a.slug,
        a.excerpt || "",
        a.content || "",
        a.coverImage || null,
        a.category || "",
        JSON.stringify(a.tags || []),
        a.author || "",
        a.published ? 1 : 0,
        a.showOnHome ? 1 : 0,
        a.seoTitle || "",
        a.seoDescription || "",
        JSON.stringify(a.seoKeywords || []),
        a.ogImage || null,
        a.originalUrl || null,
        toMysqlDateTime(a.createdAt),
        toMysqlDateTime(a.updatedAt),
      ]
    );
    console.log(`  article upserted: ${a.slug}`);
  }

  for (const p of projects) {
    await pool.execute(
      `INSERT INTO projects (
        id, title, slug, category, cover_image, concept, gallery,
        before_image, after_image, materials, featured, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      [
        p._id,
        p.title,
        p.slug,
        p.category || "",
        p.coverImage || null,
        p.concept || "",
        JSON.stringify(p.gallery || []),
        p.beforeImage || null,
        p.afterImage || null,
        JSON.stringify(p.materials || []),
        p.featured ? 1 : 0,
        toMysqlDateTime(p.createdAt),
      ]
    );
    console.log(`  project upserted: ${p.slug}`);
  }

  await pool.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
