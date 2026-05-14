"use client";

import { useState, useRef } from "react";
import UploadedImage from "@/components/UploadedImage";

interface ImageUploaderProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
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
