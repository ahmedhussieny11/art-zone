import fs from "fs";
import path from "path";
import type { SiteLocale } from "@/lib/locale-dict";
import type { Service, Project, Testimonial, Article } from "@/lib/data";
import type { VideoScrollConfig } from "@/lib/video-scroll-config";
import type { ZoomPortalConfig, ZoomPortalLayer, ZoomPortalHotspot } from "@/lib/zoom-portal-data";
import type { BrandSliderConfig, BrandSliderSlide } from "@/lib/data";

const LOCALES = path.join(process.cwd(), "data", "locales");

function readLocaleJson<T extends Record<string, unknown>>(name: string): T {
  const p = path.join(LOCALES, name);
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    /* ignore */
  }
  return {} as T;
}

let servicesEn: Record<string, { title?: string; description?: string }> | null = null;
let projectsEn: Record<string, { title?: string; concept?: string; materials?: string[] }> | null = null;
let testimonialsEn: Record<string, { clientName?: string; quote?: string; projectTitle?: string }> | null = null;
let articlesEn: Record<string, Partial<Article>> | null = null;
let videoScrollEn: Partial<VideoScrollConfig> | null = null;
let zoomPortalEn: Partial<ZoomPortalConfig> & { layers?: Partial<ZoomPortalLayer>[] } | null = null;
let brandSliderEn: Partial<BrandSliderConfig> & { slides?: Partial<BrandSliderSlide>[] } | null = null;

function loadServicesEn() {
  if (!servicesEn) servicesEn = readLocaleJson<Record<string, { title?: string; description?: string }>>("services-en.json");
  return servicesEn;
}
function loadProjectsEn() {
  if (!projectsEn) projectsEn = readLocaleJson<Record<string, { title?: string; concept?: string; materials?: string[] }>>("projects-en.json");
  return projectsEn;
}
function loadTestimonialsEn() {
  if (!testimonialsEn) testimonialsEn = readLocaleJson<Record<string, { clientName?: string; quote?: string; projectTitle?: string }>>("testimonials-en.json");
  return testimonialsEn;
}
function loadArticlesEn() {
  if (!articlesEn) articlesEn = readLocaleJson<Record<string, Partial<Article>>>("articles-en.json");
  return articlesEn;
}
function loadVideoScrollEn() {
  if (!videoScrollEn) videoScrollEn = readLocaleJson<Partial<VideoScrollConfig>>("video-scroll-en.json");
  return videoScrollEn;
}
function loadZoomPortalEn() {
  if (!zoomPortalEn) zoomPortalEn = readLocaleJson<Partial<ZoomPortalConfig> & { layers?: Partial<ZoomPortalLayer>[] }>("zoom-portal-en.json");
  return zoomPortalEn;
}
function loadBrandSliderEn() {
  if (!brandSliderEn) brandSliderEn = readLocaleJson<Partial<BrandSliderConfig> & { slides?: Partial<BrandSliderSlide>[] }>("brand-slider-en.json");
  return brandSliderEn;
}

export function getLocalizedService(service: Service, locale: SiteLocale): Service {
  if (locale !== "en") return service;
  const o = loadServicesEn()[service._id];
  if (!o) return service;
  return {
    ...service,
    ...(o.title ? { title: o.title } : {}),
    ...(o.description ? { description: o.description } : {}),
  };
}

export function getLocalizedServices(services: Service[], locale: SiteLocale): Service[] {
  return services.map((s) => getLocalizedService(s, locale));
}

export function getLocalizedProject(project: Project, locale: SiteLocale): Project {
  if (locale !== "en") return project;
  const o = loadProjectsEn()[project.slug];
  if (!o) return project;
  return {
    ...project,
    ...(o.title ? { title: o.title } : {}),
    ...(o.concept ? { concept: o.concept } : {}),
    ...(o.materials?.length ? { materials: o.materials } : {}),
  };
}

export function getLocalizedProjects(projects: Project[], locale: SiteLocale): Project[] {
  return projects.map((p) => getLocalizedProject(p, locale));
}

export function getLocalizedTestimonial(t: Testimonial, locale: SiteLocale): Testimonial {
  if (locale !== "en") return t;
  const o = loadTestimonialsEn()[t._id];
  if (!o) return t;
  return {
    ...t,
    ...(o.clientName ? { clientName: o.clientName } : {}),
    ...(o.quote ? { quote: o.quote } : {}),
    ...(o.projectTitle ? { projectTitle: o.projectTitle } : {}),
  };
}

export function getLocalizedTestimonials(items: Testimonial[], locale: SiteLocale): Testimonial[] {
  return items.map((x) => getLocalizedTestimonial(x, locale));
}

export function getLocalizedArticle(article: Article, locale: SiteLocale): Article {
  if (locale !== "en") return article;
  const o = loadArticlesEn()[article.slug];
  if (!o) return article;
  return { ...article, ...o };
}

export function getLocalizedVideoScrollConfig(cfg: VideoScrollConfig, locale: SiteLocale): VideoScrollConfig {
  if (locale !== "en") return cfg;
  const o = loadVideoScrollEn();
  return { ...cfg, ...o };
}

function mergeHotspot(h: ZoomPortalHotspot, patch?: Partial<ZoomPortalHotspot>): ZoomPortalHotspot {
  if (!patch) return h;
  return { ...h, ...patch };
}

function mergeLayer(layer: ZoomPortalLayer, patch?: Partial<ZoomPortalLayer>): ZoomPortalLayer {
  if (!patch) return layer;
  let hotspots = layer.hotspots;
  if (patch.hotspots?.length && layer.hotspots?.length) {
    hotspots = layer.hotspots.map((h) => {
      const hp = patch.hotspots!.find((x) => x && x.id === h.id);
      return hp ? mergeHotspot(h, hp) : h;
    });
  }
  const { hotspots: _hp, ...patchRest } = patch;
  return {
    ...layer,
    ...patchRest,
    hotspots: hotspots ?? layer.hotspots,
  };
}

export function getLocalizedZoomPortalConfig(cfg: ZoomPortalConfig, locale: SiteLocale): ZoomPortalConfig {
  if (locale !== "en") return cfg;
  const o = loadZoomPortalEn() as Partial<ZoomPortalConfig> & {
    layers?: Partial<ZoomPortalLayer>[];
  };
  if (!o || Object.keys(o).length === 0) return cfg;
  const { layers: overlayLayers, ...rest } = o;
  const base = { ...cfg, ...rest } as ZoomPortalConfig;
  if (overlayLayers?.length && cfg.layers?.length) {
    base.layers = cfg.layers.map((layer) => {
      const patch = overlayLayers.find((l) => l && (l as ZoomPortalLayer).id === layer.id) as
        | Partial<ZoomPortalLayer>
        | undefined;
      return mergeLayer(layer, patch);
    });
  }
  return base;
}

export function getLocalizedBrandSliderConfig(cfg: BrandSliderConfig, locale: SiteLocale): BrandSliderConfig {
  if (locale !== "en") return cfg;
  const o = loadBrandSliderEn();
  if (!o || Object.keys(o).length === 0) return cfg;
  const out: BrandSliderConfig = {
    ...cfg,
    ...(o.sectionEyebrow !== undefined ? { sectionEyebrow: o.sectionEyebrow } : {}),
    ...(o.sectionTitle !== undefined ? { sectionTitle: o.sectionTitle } : {}),
    ...(o.cta1Text !== undefined ? { cta1Text: o.cta1Text } : {}),
    ...(o.cta2Text !== undefined ? { cta2Text: o.cta2Text } : {}),
    slides:
      o.slides && o.slides.length > 0
        ? cfg.slides.map((slide) => {
            const p = o.slides!.find((s) => s.id === slide.id);
            if (!p) return slide;
            return {
              ...slide,
              ...(p.title !== undefined ? { title: p.title } : {}),
              ...(p.subtitle !== undefined ? { subtitle: p.subtitle } : {}),
            };
          })
        : cfg.slides,
  };
  return out;
}
