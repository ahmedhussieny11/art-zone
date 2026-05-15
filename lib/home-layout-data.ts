import fs from "fs";
import path from "path";
import type { VideoScrollPosition } from "@/lib/video-scroll-config";
import {
  DEFAULT_HOME_LAYOUT,
  normalizeHomeLayout,
  orderWithVideoScrollAfter,
  type HomeLayoutConfig,
  type HomeSectionId,
} from "@/lib/home-layout-config";

const DATA_FILE = path.join(process.cwd(), "data", "home-layout.json");

const POSITION_ANCHOR: Record<VideoScrollPosition, HomeSectionId> = {
  "after-hero": "hero",
  "after-bento": "bento",
  "after-brand-slider": "brand-slider",
  "after-projects": "projects",
  "after-zoom-portal": "zoom-portal",
  "after-steps": "steps",
  "after-testimonials": "testimonials",
  "after-articles": "articles",
};

function readRaw(): Partial<HomeLayoutConfig> | null {
  if (!fs.existsSync(DATA_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Partial<HomeLayoutConfig>;
  } catch {
    return null;
  }
}

/** Build initial layout from legacy video-scroll `position` when home-layout.json is missing. */
export function layoutFromVideoScrollPosition(
  position: VideoScrollPosition,
): HomeLayoutConfig {
  return {
    sections: orderWithVideoScrollAfter(
      POSITION_ANCHOR[position] ?? "bento",
      DEFAULT_HOME_LAYOUT.sections,
    ),
  };
}

export function getHomeLayoutConfig(
  legacyVideoPosition?: VideoScrollPosition,
): HomeLayoutConfig {
  const raw = readRaw();
  if (raw) return normalizeHomeLayout(raw);
  if (legacyVideoPosition) {
    return normalizeHomeLayout(layoutFromVideoScrollPosition(legacyVideoPosition));
  }
  return normalizeHomeLayout(DEFAULT_HOME_LAYOUT);
}

export function saveHomeLayoutConfig(config: HomeLayoutConfig): void {
  const normalized = normalizeHomeLayout(config);
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2), "utf-8");
}
