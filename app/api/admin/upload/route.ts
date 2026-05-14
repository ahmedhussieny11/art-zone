import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * على Vercel (وغيرها من serverless) الملفات المكتوبة تحت public/uploads لا تُحفظ بين الطلبات.
 * عيّن BLOB_READ_WRITE_TOKEN من لوحة Vercel → Storage → Blob → Connect to Project
 * (أو أنشئ توكن من إعدادات Blob) لرفع الصور إلى Vercel Blob وإرجاع رابط https دائم.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "لم يتم اختيار ملفات" }, { status: 400 });
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const uploadedPaths: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

      if (blobToken) {
        const blob = await put(filename, buffer, {
          access: "public",
          token: blobToken,
        });
        uploadedPaths.push(blob.url);
      } else {
        ensureUploadDir();
        const filepath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, buffer);
        uploadedPaths.push(`/uploads/${filename}`);
      }
    }

    return NextResponse.json({ paths: uploadedPaths });
  } catch {
    return NextResponse.json({ error: "فشل رفع الملفات" }, { status: 500 });
  }
}
