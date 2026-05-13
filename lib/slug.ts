/**
 * Generates a URL-friendly slug from Arabic or English text.
 * - Keeps Arabic characters, English letters, and numbers
 * - Replaces spaces and special characters with hyphens
 * - Collapses multiple hyphens into one
 * - Trims leading/trailing hyphens
 */
export function generateSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FF\u0750-\u077Fa-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
