"use client";

import { useRef, useState } from "react";
import UploadedImage from "@/components/UploadedImage";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"visual" | "source">("visual");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function exec(command: string, val?: string) {
    document.execCommand(command, false, val);
    syncContent();
  }

  function syncContent() {
    if (editorRef.current) {
      onChangeRef.current(editorRef.current.innerHTML);
    }
  }

  function handleFormat(tag: string) {
    if (tag === "p") {
      exec("formatBlock", "p");
    } else if (tag.startsWith("h")) {
      exec("formatBlock", tag);
    } else if (tag === "bold") {
      exec("bold");
    } else if (tag === "italic") {
      exec("italic");
    } else if (tag === "underline") {
      exec("underline");
    } else if (tag === "ul") {
      exec("insertUnorderedList");
    } else if (tag === "ol") {
      exec("insertOrderedList");
    } else if (tag === "blockquote") {
      exec("formatBlock", "blockquote");
    } else if (tag === "link") {
      const url = prompt("أدخل الرابط:");
      if (url) exec("createLink", url);
    }
  }

  async function handleImageUpload(file: File) {
    setImageUploading(true);
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.paths?.[0]) {
        setImageUrl(data.paths[0]);
      }
    } catch {
      alert("فشل رفع الصورة");
    }
    setImageUploading(false);
  }

  function insertImage() {
    if (!imageUrl) return;
    const alt = imageAlt || "صورة";
    let html = `<figure class="my-6">`;
    html += `<img src="${imageUrl}" alt="${alt}" class="rounded-lg w-full" />`;
    if (imageCaption) {
      html += `<figcaption class="text-center text-sm text-gray-500 mt-2">${imageCaption}</figcaption>`;
    }
    html += `</figure>`;

    if (mode === "visual" && editorRef.current) {
      editorRef.current.focus();
      exec("insertHTML", html);
    } else {
      onChange(value + "\n" + html);
    }

    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
  }

  const toolbarGroups: { items: { tag: string; label: string; icon?: string }[] }[] = [
    {
      items: [
        { tag: "h1", label: "H1" },
        { tag: "h2", label: "H2" },
        { tag: "h3", label: "H3" },
        { tag: "h4", label: "H4" },
        { tag: "p", label: "¶" },
      ],
    },
    {
      items: [
        { tag: "bold", label: "B", icon: "bold" },
        { tag: "italic", label: "I", icon: "italic" },
        { tag: "underline", label: "U", icon: "underline" },
      ],
    },
    {
      items: [
        { tag: "ul", label: "•" },
        { tag: "ol", label: "1." },
        { tag: "blockquote", label: "❝" },
        { tag: "link", label: "🔗" },
      ],
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {group.items.map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={() => handleFormat(item.tag)}
                className="flex h-8 min-w-[2rem] items-center justify-center rounded px-1.5 text-xs font-bold text-charcoal transition-colors hover:bg-gold/10 hover:text-gold"
                title={item.tag.toUpperCase()}
              >
                {item.icon === "bold" ? (
                  <span className="text-sm font-black">B</span>
                ) : item.icon === "italic" ? (
                  <span className="text-sm italic font-serif">I</span>
                ) : item.icon === "underline" ? (
                  <span className="text-sm underline">U</span>
                ) : (
                  <span className="text-xs">{item.label}</span>
                )}
              </button>
            ))}
            {gi < toolbarGroups.length - 1 && (
              <div className="mx-1 h-5 w-px bg-gray-300" />
            )}
          </div>
        ))}

        <div className="mx-1 h-5 w-px bg-gray-300" />

        {/* Image button */}
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="flex h-8 items-center gap-1.5 rounded px-2 text-xs font-medium text-charcoal transition-colors hover:bg-gold/10 hover:text-gold"
          title="إدراج صورة"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5zM10.5 8.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          صورة
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mode toggle */}
        <div className="flex rounded-md border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode === "visual" ? "bg-gold text-white" : "bg-white text-warmgray hover:text-charcoal"}`}
          >
            مرئي
          </button>
          <button
            type="button"
            onClick={() => setMode("source")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${mode === "source" ? "bg-gold text-white" : "bg-white text-warmgray hover:text-charcoal"}`}
          >
            كود
          </button>
        </div>
      </div>

      {/* Editor area */}
      {mode === "visual" ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[400px] px-6 py-4 text-sm leading-relaxed outline-none prose prose-sm max-w-none [&_h1]:text-3xl [&_h1]:font-serif [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-lg [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-1 [&_p]:mb-3 [&_p]:leading-relaxed [&_blockquote]:border-r-4 [&_blockquote]:border-gold [&_blockquote]:pr-4 [&_blockquote]:italic [&_blockquote]:text-warmgray [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_img]:rounded-lg [&_img]:my-4 [&_a]:text-gold [&_a]:underline [&_figure]:my-4 [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:text-warmgray [&_figcaption]:mt-2"
          dangerouslySetInnerHTML={{ __html: value }}
          onInput={syncContent}
          onBlur={syncContent}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[400px] w-full px-6 py-4 font-mono text-sm leading-relaxed outline-none resize-y"
          dir="auto"
        />
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-charcoal mb-4">إدراج صورة</h3>

            {/* Upload area */}
            {!imageUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-gold"
              >
                {imageUploading ? (
                  <p className="text-sm text-warmgray">جاري الرفع...</p>
                ) : (
                  <>
                    <svg className="mb-2 h-8 w-8 text-warmgray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-sm text-warmgray">اضغط لرفع صورة</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>
            ) : (
              <div className="relative mb-4">
                <UploadedImage src={imageUrl} alt="معاينة" width={400} height={250} className="w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal">النص البديل (Alt Text) *</label>
                <input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gold"
                  placeholder="وصف الصورة للسيو وإمكانية الوصول"
                />
                <p className="mt-1 text-xs text-warmgray">مهم للسيو - اوصف الصورة بكلمات مفتاحية مناسبة</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-charcoal">تعليق الصورة (اختياري)</label>
                <input
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gold"
                  placeholder="تعليق يظهر تحت الصورة"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={insertImage}
                disabled={!imageUrl}
                className="rounded-lg bg-gold px-5 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-40"
              >
                إدراج الصورة
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl("");
                  setImageAlt("");
                  setImageCaption("");
                }}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm text-warmgray hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
