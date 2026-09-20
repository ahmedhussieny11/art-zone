import type { RowDataPacket } from "mysql2";
import type { Article } from "@/lib/data";
import {
  execute,
  fromMysqlDateTime,
  parseJsonArray,
  query,
  toMysqlDateTime,
} from "@/lib/db";

interface ArticleRow extends RowDataPacket {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  tags: unknown;
  author: string | null;
  published: number | boolean;
  show_on_home: number | boolean;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: unknown;
  og_image: string | null;
  original_url: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function rowToArticle(row: ArticleRow): Article {
  return {
    _id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    content: row.content || "",
    coverImage: row.cover_image,
    category: row.category || "",
    tags: parseJsonArray(row.tags),
    author: row.author || "",
    published: Boolean(row.published),
    showOnHome: Boolean(row.show_on_home),
    seoTitle: row.seo_title || "",
    seoDescription: row.seo_description || "",
    seoKeywords: parseJsonArray(row.seo_keywords),
    ogImage: row.og_image,
    originalUrl: row.original_url,
    createdAt: fromMysqlDateTime(row.created_at),
    updatedAt: fromMysqlDateTime(row.updated_at),
  };
}

export async function listArticles(): Promise<Article[]> {
  const rows = await query<ArticleRow[]>(
    `SELECT * FROM articles ORDER BY updated_at DESC`
  );
  return rows.map(rowToArticle);
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const rows = await query<ArticleRow[]>(
    `SELECT * FROM articles WHERE id = :id LIMIT 1`,
    { id }
  );
  return rows[0] ? rowToArticle(rows[0]) : undefined;
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const decoded = decodeURIComponent(slug);
  const rows = await query<ArticleRow[]>(
    `SELECT * FROM articles WHERE slug = :slug OR slug = :decoded LIMIT 1`,
    { slug, decoded }
  );
  return rows[0] ? rowToArticle(rows[0]) : undefined;
}

export async function getArticleByOriginalUrl(
  originalUrl: string
): Promise<Article | undefined> {
  const rows = await query<ArticleRow[]>(
    `SELECT * FROM articles WHERE original_url = :originalUrl LIMIT 1`,
    { originalUrl }
  );
  return rows[0] ? rowToArticle(rows[0]) : undefined;
}

export async function upsertArticle(article: Article): Promise<void> {
  await execute(
    `INSERT INTO articles (
      id, title, slug, excerpt, content, cover_image, category, tags, author,
      published, show_on_home, seo_title, seo_description, seo_keywords, og_image,
      original_url, created_at, updated_at
    ) VALUES (
      :id, :title, :slug, :excerpt, :content, :coverImage, :category, :tags, :author,
      :published, :showOnHome, :seoTitle, :seoDescription, :seoKeywords, :ogImage,
      :originalUrl, :createdAt, :updatedAt
    )
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
    {
      id: article._id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      coverImage: article.coverImage,
      category: article.category,
      tags: JSON.stringify(article.tags || []),
      author: article.author,
      published: article.published ? 1 : 0,
      showOnHome: article.showOnHome ? 1 : 0,
      seoTitle: article.seoTitle,
      seoDescription: article.seoDescription,
      seoKeywords: JSON.stringify(article.seoKeywords || []),
      ogImage: article.ogImage,
      originalUrl: article.originalUrl ?? null,
      createdAt: toMysqlDateTime(article.createdAt),
      updatedAt: toMysqlDateTime(article.updatedAt),
    }
  );
}

export async function removeArticle(id: string): Promise<void> {
  await execute(`DELETE FROM articles WHERE id = :id`, { id });
}
