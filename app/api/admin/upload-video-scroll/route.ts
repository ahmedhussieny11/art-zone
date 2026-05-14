import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import os from "os";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const maxDuration = 300;

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Re-encode any input video into a format ideal for scroll-bound playback:
 *   - H.264 main profile  ➜ universal browser compatibility (fixes HEVC/AV1/etc.)
 *   - Every frame keyframe (g=1) ➜ instant seeking for smooth scrubbing
 *   - Scaled to max 540px wide ➜ decode أخف على الموبايل
 *   - No audio ➜ smaller, no autoplay restrictions
 *   - +faststart ➜ playback starts before download completes
 */
async function reencode(input: string, output: string): Promise<void> {
  const ffmpegModule = await import("ffmpeg-static");
  const ffmpegPath = (ffmpegModule.default ?? ffmpegModule) as unknown as
    | string
    | null;
  if (!ffmpegPath || typeof ffmpegPath !== "string") {
    throw new Error("ffmpeg-static binary not available in this environment");
  }
  if (!fs.existsSync(ffmpegPath)) {
    throw new Error(`ffmpeg binary missing at ${ffmpegPath}`);
  }

  return new Promise((resolve, reject) => {
    const args = [
      "-hide_banner",
      "-loglevel", "error",
      "-y",
      "-i", input,
      "-an",
      "-vf", "scale='min(540,iw)':-2",
      "-c:v", "libx264",
      "-profile:v", "main",
      "-preset", "veryfast",
      "-tune", "zerolatency",
      "-crf", "24",
      "-pix_fmt", "yuv420p",
      "-g", "1",
      "-keyint_min", "1",
      "-sc_threshold", "0",
      "-bf", "0",
      "-x264-params", "no-scenecut=1:bframes=0:ref=1",
      "-movflags", "+faststart",
      output,
    ];
    const proc = spawn(ffmpegPath, args);
    let stderr = "";
    proc.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-400)}`));
    });
  });
}

export async function POST(request: Request) {
  let tmpInput: string | null = null;
  let tmpOutput: string | null = null;

  try {
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("files")) as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 });
    }

    /* ── Write the upload to a temp file so ffmpeg can read it ── */
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "scroll-vid-"));
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const inputExt = path.extname(file.name) || ".mp4";
    tmpInput = path.join(tmpDir, `in${inputExt}`);
    tmpOutput = path.join(tmpDir, `out.mp4`);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(tmpInput, Buffer.from(arrayBuffer));

    /* ── Try to re-encode. Fall back to raw if ffmpeg unavailable. ── */
    let finalBuffer: Buffer;
    let processed = false;
    let warning: string | null = null;

    try {
      await reencode(tmpInput, tmpOutput);
      finalBuffer = fs.readFileSync(tmpOutput);
      processed = true;
    } catch (err) {
      console.warn(
        "[upload-video-scroll] re-encode failed, falling back to raw:",
        err
      );
      finalBuffer = Buffer.from(arrayBuffer);
      warning =
        "تعذر إعادة الترميز التلقائي — تم رفع الفيديو كما هو. لو ما اشتغلش، رمّزه يدوياً بـ H.264.";
    }

    /* ── Save the final file ── */
    const finalName = `scroll-${id}.mp4`;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    let publicPath: string;
    if (blobToken) {
      const blob = await put(finalName, finalBuffer, {
        access: "public",
        token: blobToken,
        contentType: "video/mp4",
      });
      publicPath = blob.url;
    } else {
      ensureUploadDir();
      const dest = path.join(UPLOAD_DIR, finalName);
      fs.writeFileSync(dest, finalBuffer);
      publicPath = `/uploads/${finalName}`;
    }

    return NextResponse.json({
      path: publicPath,
      paths: [publicPath],
      processed,
      sizeMB: +(finalBuffer.length / 1024 / 1024).toFixed(2),
      warning,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || "فشل معالجة الفيديو" },
      { status: 500 }
    );
  } finally {
    try {
      if (tmpInput) fs.unlinkSync(tmpInput);
    } catch {}
    try {
      if (tmpOutput) fs.unlinkSync(tmpOutput);
    } catch {}
  }
}
