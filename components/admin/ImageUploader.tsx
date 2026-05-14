"use client";

import { useState, useRef } from "react";
import UploadedImage from "@/components/UploadedImage";

interface ImageUploaderProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
}

interface FileUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** HTML accept attribute, e.g. "video/*" */
  accept?: string;
  /** Optional human-readable hint, e.g. "MP4 / WebM — 50 MB كحد أقصى" */
  hint?: string;
  /** Override the upload endpoint. Default: /api/admin/upload */
  uploadEndpoint?: string;
  /** Field name to use in the multipart body. Default: "files" */
  fieldName?: string;
}

export function VideoUploader({
  label,
  value,
  onChange,
  accept = "video/*",
  hint,
  uploadEndpoint = "/api/admin/upload",
  fieldName = "files",
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState<string>("");
  const [warning, setWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setStatusLabel("جاري الرفع…");
    setWarning(null);

    const fd = new FormData();
    fd.append(fieldName, file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadEndpoint);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.round((ev.loaded / ev.total) * 100);
        setProgress(pct);
        if (pct >= 100) setStatusLabel("جاري المعالجة…");
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as {
          path?: string;
          paths?: string[];
          warning?: string | null;
          error?: string;
        };
        const url = data.path ?? data.paths?.[0];
        if (url) onChange(url);
        if (data.warning) setWarning(data.warning);
        if (data.error) setWarning(data.error);
      } catch {
        setWarning("استجابة غير متوقعة من السيرفر");
      }
      setUploading(false);
      setProgress(0);
      setStatusLabel("");
      if (inputRef.current) inputRef.current.value = "";
    };
    xhr.onerror = () => {
      setUploading(false);
      setProgress(0);
      setStatusLabel("");
      setWarning("فشل الاتصال بالسيرفر");
    };
    xhr.send(fd);
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-charcoal">
        {label}
      </label>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        {value ? (
          <div className="relative overflow-hidden rounded-lg bg-black">
            <video
              src={value}
              controls
              muted
              playsInline
              className="h-48 w-full object-contain"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-lg hover:bg-red-600"
              title="حذف"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-warmgray">
            <span className="text-xs">لا يوجد فيديو</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            value={value}
            dir="ltr"
            placeholder="/scroll-video.mp4 أو https://…"
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-gold px-4 py-2 text-xs font-medium text-white hover:bg-gold-dark disabled:opacity-50"
          >
            {uploading
              ? statusLabel.includes("معالجة")
                ? "جاري المعالجة…"
                : `${progress}%`
              : "رفع فيديو"}
          </button>
        </div>

        {uploading && (
          <div className="space-y-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gold transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-warmgray">
              {statusLabel}
              {statusLabel.includes("معالجة") &&
                " — جاري إعادة الترميز للسلاسة (قد يأخذ بضع ثواني)"}
            </p>
          </div>
        )}

        {warning && !uploading && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
            {warning}
          </p>
        )}

        {hint && <p className="text-[10px] text-warmgray">{hint}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}

export function SingleImageUploader({ label, value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("files", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.paths?.[0]) onChange(data.paths[0]);
    } catch { /* ignore */ }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-charcoal">{label}</label>
      {value ? (
        <div className="group relative inline-block">
          <UploadedImage src={value} alt={label} width={200} height={150} className="rounded-lg border border-gray-200 object-cover" style={{ width: 200, height: 150 }} />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-[150px] w-[200px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-warmgray transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-xs">جاري الرفع...</span>
          ) : (
            <div className="text-center">
              <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-1 block text-xs">اختر صورة</span>
            </div>
          )}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}

interface GalleryUploaderProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
}

export function GalleryUploader({ label, value, onChange }: GalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append("files", files[i]);
    }
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.paths) onChange([...value, ...data.paths]);
    } catch { /* ignore */ }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-charcoal">{label}</label>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={i} className="group relative">
            <UploadedImage src={url} alt={`صورة ${i + 1}`} width={150} height={120} className="rounded-lg border border-gray-200 object-cover" style={{ width: 150, height: 120 }} />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-[120px] w-[150px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-warmgray transition-colors hover:border-gold hover:text-gold disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-xs">جاري الرفع...</span>
          ) : (
            <div className="text-center">
              <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-1 block text-xs">أضف صور</span>
            </div>
          )}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
    </div>
  );
}
