-- Run once in Hostinger phpMyAdmin (select your database first).

CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content MEDIUMTEXT,
  cover_image VARCHAR(1000) NULL,
  category VARCHAR(255),
  tags JSON,
  author VARCHAR(255),
  published TINYINT(1) NOT NULL DEFAULT 0,
  show_on_home TINYINT(1) NOT NULL DEFAULT 0,
  seo_title VARCHAR(500),
  seo_description TEXT,
  seo_keywords JSON,
  og_image VARCHAR(1000) NULL,
  original_url VARCHAR(1000) NULL,
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  UNIQUE KEY uq_articles_slug (slug),
  KEY idx_articles_original_url (original_url(255)),
  KEY idx_articles_published_home (published, show_on_home)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  cover_image VARCHAR(1000) NULL,
  concept TEXT,
  gallery JSON,
  before_image VARCHAR(1000) NULL,
  after_image VARCHAR(1000) NULL,
  materials JSON,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL,
  UNIQUE KEY uq_projects_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
