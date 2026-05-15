/**
 * Home page section order and visibility.
 * Safe to import from Client Components.
 */

export type HomeSectionId =
  | "hero"
  | "video-scroll"
  | "bento"
  | "brand-slider"
  | "projects"
  | "zoom-portal"
  | "steps"
  | "testimonials"
  | "articles"
  | "instagram"
  | "cta";

export interface HomeLayoutSection {
  id: HomeSectionId;
  enabled: boolean;
}

export interface HomeLayoutConfig {
  sections: HomeLayoutSection[];
}

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: "البانر الرئيسي (Hero)",
  "video-scroll": "سكروب الإطارات",
  bento: "قسم «عن الشركة»",
  "brand-slider": "سلايدر الصور",
  projects: "المشاريع المميزة",
  "zoom-portal": "بوابة التصميم",
  steps: "خطوات العمل",
  testimonials: "آراء العملاء",
  articles: "آخر المقالات",
  instagram: "تابعنا / السوشيال",
  cta: "بانر التواصل (CTA)",
};

/** Default stack (matches previous hard-coded home order). */
export const DEFAULT_HOME_LAYOUT: HomeLayoutConfig = {
  sections: [
    { id: "hero", enabled: true },
    { id: "bento", enabled: true },
    { id: "video-scroll", enabled: true },
    { id: "brand-slider", enabled: true },
    { id: "projects", enabled: true },
    { id: "zoom-portal", enabled: true },
    { id: "steps", enabled: true },
    { id: "testimonials", enabled: true },
    { id: "articles", enabled: true },
    { id: "instagram", enabled: true },
    { id: "cta", enabled: true },
  ],
};

const ALL_IDS = DEFAULT_HOME_LAYOUT.sections.map((s) => s.id);

/** Insert video-scroll once, directly after the anchor section (legacy position API). */
export function orderWithVideoScrollAfter(
  anchor: HomeSectionId,
  sections: HomeLayoutSection[] = DEFAULT_HOME_LAYOUT.sections,
): HomeLayoutSection[] {
  const enabledById = new Map(sections.map((s) => [s.id, s.enabled]));
  const withoutVideo = sections
    .filter((s) => s.id !== "video-scroll")
    .map((s) => s.id);
  const anchorIdx = withoutVideo.indexOf(anchor);
  const order: HomeSectionId[] =
    anchorIdx === -1
      ? [...withoutVideo, "video-scroll"]
      : [
          ...withoutVideo.slice(0, anchorIdx + 1),
          "video-scroll",
          ...withoutVideo.slice(anchorIdx + 1),
        ];
  return order.map((id) => ({
    id,
    enabled: enabledById.get(id) ?? true,
  }));
}

export function normalizeHomeLayout(
  input: Partial<HomeLayoutConfig> | null | undefined,
): HomeLayoutConfig {
  const list = input?.sections?.length ? [...input.sections] : [...DEFAULT_HOME_LAYOUT.sections];
  const seen = new Set<HomeSectionId>();
  const merged: HomeLayoutSection[] = [];

  for (const s of list) {
    if (!ALL_IDS.includes(s.id) || seen.has(s.id)) continue;
    seen.add(s.id);
    merged.push({ id: s.id, enabled: s.enabled !== false });
  }

  for (const id of ALL_IDS) {
    if (!seen.has(id)) merged.push({ id, enabled: true });
  }

  return { sections: merged };
}
