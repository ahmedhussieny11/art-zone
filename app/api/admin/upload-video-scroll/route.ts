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

/** سلاسة السكروب: كل إطار keyframe + H.264 + عرض معقول */
const VF_PRESETS = [
  /* بدون علامات اقتباس — أوثق على ويندوز من min(540,iw) داخل quotes */
  "fps=30,scale=min(540\\,iw):-2",
  "fps=30,scale=540:-2",
  "fps=24,scale=720:-2",
] as const;

async function collectFfmpegCandidates(): Promise<string[]> {
  const list: string[] = [];
  for (const key of ["FFMPEG_PATH", "FFMPEG_BIN"] as const) {
    const v = process.env[key]?.trim();
    if (v && fs.existsSync(v)) list.push(v);
  }
  try {
    const mod = await import("ffmpeg-static");
    const p = (mod.default ?? mod) as unknown;
    if (typeof p === "string" && p && fs.existsSync(p)) list.push(p);
  } catch {
    /* ffmpeg-static غير متاح */
  }
  list.push("ffmpeg");
  return [...new Set(list)];
}

function runFfmpeg(
  ffmpegPath: string,
  input: string,
  output: string,
  vf: string,
  simpleX264: boolean,
): Promise<void> {
  const x264Args = simpleX264
    ? [
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-g",
        "1",
        "-keyint_min",
        "1",
        "-movflags",
        "+faststart",
      ]
    : [
        "-c:v",
        "libx264",
        "-profile:v",
        "main",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-pix_fmt",
        "yuv420p",
        "-g",
        "1",
        "-keyint_min",
        "1",
        "-sc_threshold",
        "0",
        "-bf",
        "0",
        "-x264-params",
        "no-scenecut=1:bframes=0:ref=1",
        "-movflags",
        "+faststart",
      ];

  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    input,
    "-an",
    "-vf",
    vf,
    ...x264Args,
    output,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, args, {
      windowsHide: true,
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    proc.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    proc.on("error", (e) => reject(e));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg ${ffmpegPath} exit ${code}: ${stderr.slice(-800)}`));
    });
  });
}

/**
 * إعادة ترميز لسلاسة السكروب: H.264 + g=1 + faststart.
 * يجرّب عدة مسارات لـ ffmpeg (متغير البيئة، ffmpeg-static، PATH) وفلاتر أبسط عند الفشل.
 */
async function reencode(input: string, output: string): Promise<void> {
  const candidates = await collectFfmpegCandidates();
  let lastErr: Error | null = null;

  for (const bin of candidates) {
    for (const vf of VF_PRESETS) {
      for (const simple of [false, true] as const) {
        try {
          await runFfmpeg(bin, input, output, vf, simple);
          return;
        } catch (e) {
          lastErr = e instanceof Error ? e : new Error(String(e));
        }
      }
    }
  }

  throw lastErr ?? new Error("ffmpeg failed with no candidates");
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

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "scroll-vid-"));
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const inputExt = path.extname(file.name) || ".mp4";
    tmpInput = path.join(tmpDir, `in${inputExt}`);
    tmpOutput = path.join(tmpDir, `out.mp4`);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(tmpInput, Buffer.from(arrayBuffer));

    let finalBuffer: Buffer;
    let processed = false;
    let warning: string | null = null;

    try {
      await reencode(tmpInput, tmpOutput);
      finalBuffer = fs.readFileSync(tmpOutput);
      processed = true;
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.warn("[upload-video-scroll] re-encode failed, falling back to raw:", detail);
      finalBuffer = Buffer.from(arrayBuffer);
      warning =
        "تعذر إعادة الترميز التلقائي — الفيديو اترفع كما هو (فيديو واتساب غالباً بدون keyframes كثيرة = سكروب متقطع). " +
        "ثبّت FFmpeg في PATH أو عيّن في `.env` أحد المتغيرين: FFMPEG_PATH أو FFMPEG_BIN (مسار ffmpeg.exe كامل) ثم ارفع الفيديو تاني، " +
        "أو رمّزه يدوياً إلى H.264 مع keyframe كل إطار.";
    }

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
      { status: 500 },
    );
  } finally {
    try {
      if (tmpInput) fs.unlinkSync(tmpInput);
    } catch {
      /* ignore */
    }
    try {
      if (tmpOutput) fs.unlinkSync(tmpOutput);
    } catch {
      /* ignore */
    }
  }
}
