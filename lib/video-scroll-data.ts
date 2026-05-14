import fs from "fs";
import path from "path";
import {
  DEFAULT_VIDEO_SCROLL_CONFIG,
  type VideoScrollConfig,
} from "@/lib/video-scroll-config";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
    return defaultValue;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function writeJson<T>(filename: string, data: T): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

export function getVideoScrollConfig(): VideoScrollConfig {
  const stored = readJson<Partial<VideoScrollConfig>>(
    "video-scroll.json",
    DEFAULT_VIDEO_SCROLL_CONFIG
  );
  return { ...DEFAULT_VIDEO_SCROLL_CONFIG, ...stored };
}

export function saveVideoScrollConfig(config: VideoScrollConfig): void {
  writeJson("video-scroll.json", config);
}
