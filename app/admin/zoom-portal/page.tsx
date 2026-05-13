"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ZoomPortalConfig, ZoomPortalLayer, ZoomPortalHotspot } from "@/lib/zoom-portal-data";
import { SingleImageUploader } from "@/components/admin/ImageUploader";

/* ─── helpers ─────────────────────────────────────────────────── */
let uid = 0;
const genId = () => `zp-${Date.now()}-${uid++}`;

const DEFAULT_LAYER: () => ZoomPortalLayer = () => ({
  id: genId(),
  src: "",
  label: "طبقة جديدة",
  zoomOriginX: 50,
  zoomOriginY: 50,
  maxZoom: 8,
  entryScale: 0.45,
  hotspots: [],
});

/* ─── ImageEditor: click to set zoom origin + click to add hotspot ─ */
function ImageEditor({
  layer,
  index,
  total,
  onChange,
}: {
  layer: ZoomPortalLayer;
  index: number;
  total: number;
  onChange: (updated: ZoomPortalLayer) => void;
}) {
  const [mode, setMode] = useState<"origin" | "hotspot" | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<ZoomPortalHotspot | null>(null);
  const [isNew, setIsNew] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  /* Compute the layer's expected visible scroll window (guidance only) */
  const n = total;
  const seg = n <= 1 ? 1 : 1 / (n - 1);
  const visStart = index === 0 ? 0 : parseFloat(((index - 1) * seg * 0.8).toFixed(2));
  const visEnd = index === n - 1 ? 1 : parseFloat(((index + 1) * seg * 0.2).toFixed(2));

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!imgRef.current || !mode) return;
      const rect = imgRef.current.getBoundingClientRect();
      const x = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
      const y = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));

      if (mode === "origin") {
        onChange({ ...layer, zoomOriginX: x, zoomOriginY: y });
        setMode(null);
      } else if (mode === "hotspot") {
        const newH: ZoomPortalHotspot = {
          id: genId(),
          x, y,
          title: "",
          value: "",
          note: "",
          scrollStart: parseFloat(visStart.toFixed(2)),
          scrollEnd: parseFloat(Math.min(visEnd + 0.05, visEnd < 0.5 ? 0.25 : 0.75).toFixed(2)),
        };
        setEditingHotspot(newH);
        setIsNew(true);
        setMode(null);
      }
    },
    [mode, layer, onChange, visStart, visEnd]
  );

  const saveHotspot = (h: ZoomPortalHotspot) => {
    const hotspots = isNew
      ? [...layer.hotspots, h]
      : layer.hotspots.map((x) => (x.id === h.id ? h : x));
    onChange({ ...layer, hotspots });
    setEditingHotspot(null);
    setIsNew(false);
  };

  const deleteHotspot = (id: string) => {
    onChange({ ...layer, hotspots: layer.hotspots.filter((h) => h.id !== id) });
    if (editingHotspot?.id === id) setEditingHotspot(null);
  };

  return (
    <div className="space-y-3">
      {/* Mode buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode(mode === "origin" ? null : "origin")}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "origin"
              ? "bg-amber-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          <span className="text-base">⊕</span>
          {mode === "origin" ? "اضغط على الصورة..." : "تحديد نقطة الزوم"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "hotspot" ? null : "hotspot")}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "hotspot"
              ? "bg-gold text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gold/10 hover:text-gold"
          }`}
        >
          <span className="text-base">📌</span>
          {mode === "hotspot" ? "اضغط على الصورة..." : "إضافة نقطة توضيحية"}
        </button>
        {mode && (
          <button
            type="button"
            onClick={() => setMode(null)}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200"
          >
            إلغاء
          </button>
        )}
      </div>

      {/* Image canvas */}
      {layer.src ? (
        <div
          ref={imgRef}
          onClick={handleImageClick}
          className={`relative w-full overflow-hidden rounded-xl bg-gray-900 ${
            mode ? "cursor-crosshair ring-2 ring-gold/60" : "cursor-default"
          }`}
          style={{ aspectRatio: "16/9" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={layer.src}
            alt={layer.label}
            className="h-full w-full object-cover"
            draggable={false}
          />

          {/* Zoom origin crosshair */}
          <div
            className="pointer-events-none absolute z-10"
            style={{ left: `${layer.zoomOriginX}%`, top: `${layer.zoomOriginY}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="relative flex h-6 w-6 items-center justify-center">
              <div className="absolute h-px w-6 bg-amber-400" />
              <div className="absolute h-6 w-px bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full border-2 border-amber-400 bg-transparent" />
            </div>
            <div className="absolute left-3 top-4 whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 text-[9px] text-amber-300">
              {layer.zoomOriginX}% {layer.zoomOriginY}%
            </div>
          </div>

          {/* Hotspot pins */}
          {layer.hotspots.map((h, i) => (
            <button
              key={h.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!mode) { setEditingHotspot(h); setIsNew(false); }
              }}
              className="absolute z-20 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white shadow-lg ring-2 ring-white/30 transition-transform hover:scale-125"
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
            >
              {i + 1}
            </button>
          ))}

          {mode && (
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3">
              <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs text-white backdrop-blur-sm">
                {mode === "origin" ? "اضغط لتحديد نقطة الزوم" : "اضغط لإضافة نقطة توضيحية"}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
          ارفع صورة أولاً لتظهر أدوات التحديد
        </div>
      )}

      {/* Zoom origin info */}
      <div className="flex items-center gap-4 rounded-lg bg-amber-50 px-4 py-2">
        <span className="text-xs text-amber-700 font-medium">نقطة الزوم:</span>
        <div className="flex gap-3">
          <label className="flex items-center gap-1 text-xs text-amber-700">
            X
            <input
              type="number" min={0} max={100} step={0.5}
              value={layer.zoomOriginX}
              onChange={(e) => onChange({ ...layer, zoomOriginX: Number(e.target.value) })}
              className="w-16 rounded border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-400"
            />
            %
          </label>
          <label className="flex items-center gap-1 text-xs text-amber-700">
            Y
            <input
              type="number" min={0} max={100} step={0.5}
              value={layer.zoomOriginY}
              onChange={(e) => onChange({ ...layer, zoomOriginY: Number(e.target.value) })}
              className="w-16 rounded border border-amber-200 bg-white px-2 py-1 text-xs outline-none focus:border-amber-400"
            />
            %
          </label>
        </div>
        <span className="ml-auto text-[10px] text-amber-500">أو اضغط على الصورة مباشرة</span>
      </div>

      {/* Zoom amount slider */}
      <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
        <span className="w-24 text-xs font-medium text-charcoal">عمق الزوم:</span>
        <input
          type="range" min={1} max={20} step={0.5}
          value={layer.maxZoom}
          onChange={(e) => onChange({ ...layer, maxZoom: Number(e.target.value) })}
          className="flex-1 accent-gold"
        />
        <span className="w-10 text-center text-sm font-bold text-gold">{layer.maxZoom}×</span>
        <span className="text-[10px] text-warmgray">1=خفيف / 10=عميق / 20=أقصى</span>
      </div>

      {/* Entry scale (for layers 2+) */}
      {index > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
          <span className="w-24 text-xs font-medium text-charcoal">حجم الدخول:</span>
          <input
            type="range" min={0.1} max={0.9} step={0.05}
            value={layer.entryScale}
            onChange={(e) => onChange({ ...layer, entryScale: Number(e.target.value) })}
            className="flex-1 accent-gold"
          />
          <span className="w-12 text-center text-sm font-bold text-gold">{Math.round(layer.entryScale * 100)}%</span>
          <span className="text-[10px] text-warmgray">10%=صغير جداً / 50%=متوسط</span>
        </div>
      )}

      {/* Hotspot editor panel */}
      {editingHotspot && (
        <HotspotEditor
          hotspot={editingHotspot}
          isNew={isNew}
          visStart={visStart}
          visEnd={visEnd}
          layerIndex={index}
          total={total}
          onSave={saveHotspot}
          onDelete={() => deleteHotspot(editingHotspot.id)}
          onClose={() => { setEditingHotspot(null); setIsNew(false); }}
        />
      )}

      {/* Hotspot list */}
      {layer.hotspots.length > 0 && !editingHotspot && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-warmgray">
            النقاط التوضيحية ({layer.hotspots.length})
          </p>
          <div className="space-y-1.5">
            {layer.hotspots.map((h, i) => (
              <div key={h.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-charcoal truncate">{h.title || "(بدون عنوان)"}</p>
                  <p className="text-[10px] text-warmgray truncate">{h.value}</p>
                </div>
                <span className="text-[9px] text-gray-400">
                  {Math.round(h.scrollStart * 100)}%→{Math.round(h.scrollEnd * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => { setEditingHotspot(h); setIsNew(false); }}
                  className="rounded px-2 py-1 text-[10px] text-blue-500 hover:bg-blue-50"
                >
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => deleteHotspot(h.id)}
                  className="rounded px-2 py-1 text-[10px] text-red-400 hover:bg-red-50"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── HotspotEditor ─────────────────────────────────────────────── */
function HotspotEditor({
  hotspot,
  isNew,
  visStart,
  visEnd,
  layerIndex,
  total,
  onSave,
  onDelete,
  onClose,
}: {
  hotspot: ZoomPortalHotspot;
  isNew: boolean;
  visStart: number;
  visEnd: number;
  layerIndex: number;
  total: number;
  onSave: (h: ZoomPortalHotspot) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ZoomPortalHotspot>(hotspot);
  const set = (k: keyof ZoomPortalHotspot, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  /* Guidance: expected scroll window for this layer */
  const n = total;
  const seg = n <= 1 ? 1 : 1 / (n - 1);
  const windowStart = parseFloat(Math.max(0, (layerIndex === 0 ? 0 : (layerIndex - 1) * seg * 0.85)).toFixed(2));
  const windowEnd = parseFloat(Math.min(1, (layerIndex === n - 1 ? 1 : (layerIndex + 1) * seg * 0.15 + 0.05)).toFixed(2));

  return (
    <div className="rounded-xl border border-gold/30 bg-amber-50/60 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold text-charcoal">
          {isNew ? "➕ نقطة توضيحية جديدة" : "✏️ تعديل النقطة التوضيحية"}
        </h4>
        <button type="button" onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[10px] font-semibold text-charcoal">العنوان (لون ذهبي)</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="مثال: الأرضية"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold text-charcoal">القيمة / المادة</label>
          <input
            value={form.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder="مثال: سيراميك رمادي ٦٠×٦٠"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-[10px] font-semibold text-charcoal">ملاحظة إضافية (اختياري)</label>
          <input
            value={form.note ?? ""}
            onChange={(e) => set("note", e.target.value)}
            placeholder="مثال: استيراد إيطالي"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>
      </div>

      {/* Position display */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[10px] font-semibold text-charcoal">موضع X على الصورة</label>
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={100} step={0.5} value={form.x}
              onChange={(e) => set("x", Number(e.target.value))} className="flex-1 accent-gold" />
            <span className="w-12 text-center text-xs font-bold text-gold">{form.x}%</span>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold text-charcoal">موضع Y على الصورة</label>
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={100} step={0.5} value={form.y}
              onChange={(e) => set("y", Number(e.target.value))} className="flex-1 accent-gold" />
            <span className="w-12 text-center text-xs font-bold text-gold">{form.y}%</span>
          </div>
        </div>
      </div>

      {/* Scroll timing */}
      <div className="mt-3 rounded-lg bg-white/80 p-3">
        <p className="mb-2 text-[10px] font-semibold text-charcoal">
          توقيت الظهور في الـ scroll
          <span className="mr-2 font-normal text-warmgray">
            (النافذة المتوقعة لهذه الصورة: {Math.round(windowStart * 100)}% → {Math.round(windowEnd * 100)}%)
          </span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] text-warmgray">تظهر عند</label>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={1} step={0.01} value={form.scrollStart}
                onChange={(e) => set("scrollStart", Number(e.target.value))} className="flex-1 accent-gold" />
              <span className="w-12 text-center text-xs font-bold text-gold">{Math.round(form.scrollStart * 100)}%</span>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] text-warmgray">تختفي عند</label>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={1} step={0.01} value={form.scrollEnd}
                onChange={(e) => set("scrollEnd", Number(e.target.value))} className="flex-1 accent-gold" />
              <span className="w-12 text-center text-xs font-bold text-gold">{Math.round(form.scrollEnd * 100)}%</span>
            </div>
          </div>
        </div>
        {/* Visual scroll timeline */}
        <div className="relative mt-2 h-3 rounded-full bg-gray-200">
          <div
            className="absolute h-full rounded-full bg-gold/30"
            style={{ left: `${windowStart * 100}%`, width: `${(windowEnd - windowStart) * 100}%` }}
          />
          <div
            className="absolute h-full rounded-full bg-gold"
            style={{ left: `${form.scrollStart * 100}%`, width: `${(form.scrollEnd - form.scrollStart) * 100}%` }}
          />
          <div className="pointer-events-none absolute inset-x-0 -top-4 flex justify-between text-[8px] text-gray-400">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
        <p className="mt-1 text-[9px] text-warmgray">الشريط الذهبي = وقت ظهور النقطة — الشريط الفاتح = نافذة هذه الصورة</p>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onSave(form)}
          className="rounded-lg bg-gold px-4 py-2 text-xs font-medium text-white hover:bg-gold-dark"
        >
          {isNew ? "إضافة" : "حفظ"}
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-red-50 px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-100"
          >
            حذف النقطة
          </button>
        )}
        <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-xs text-gray-500 hover:bg-gray-200">
          إلغاء
        </button>
      </div>
    </div>
  );
}

/* ─── LayerCard ─────────────────────────────────────────────────── */
function LayerCard({
  layer,
  index,
  total,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  layer: ZoomPortalLayer;
  index: number;
  total: number;
  onChange: (l: ZoomPortalLayer) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-center gap-3 px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <input
            value={layer.label}
            onChange={(e) => onChange({ ...layer, label: e.target.value })}
            className="w-full bg-transparent text-sm font-semibold text-charcoal outline-none hover:text-gold focus:text-gold"
            placeholder="اسم الطبقة"
          />
          {layer.src && (
            <p className="truncate text-[10px] text-warmgray" dir="ltr">{layer.src}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMoveUp} disabled={index === 0}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30" title="تحريك لأعلى">↑</button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30" title="تحريك لأسفل">↓</button>
          <button type="button" onClick={() => setOpen(!open)}
            className="rounded px-2 py-1 text-xs text-warmgray hover:bg-gray-100">
            {open ? "طي ▲" : "تعديل ▼"}
          </button>
          <button type="button" onClick={onDelete}
            className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50">
            حذف
          </button>
        </div>
      </div>

      {/* Card body */}
      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
          <SingleImageUploader
            label="صورة الطبقة"
            value={layer.src || null}
            onChange={(src) => onChange({ ...layer, src: src ?? "" })}
          />
          <ImageEditor layer={layer} index={index} total={total} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function ZoomPortalAdminPage() {
  const [cfg, setCfg] = useState<ZoomPortalConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/zoom-portal").then((r) => r.json()).then(setCfg);
  }, []);

  const save = async () => {
    if (!cfg) return;
    setSaving(true);
    await fetch("/api/admin/zoom-portal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = <K extends keyof ZoomPortalConfig>(k: K, v: ZoomPortalConfig[K]) =>
    setCfg((c) => c ? { ...c, [k]: v } : c);

  const updateLayer = (i: number, l: ZoomPortalLayer) =>
    setCfg((c) => { if (!c) return c; const layers = [...c.layers]; layers[i] = l; return { ...c, layers }; });

  const moveLayer = (i: number, dir: -1 | 1) =>
    setCfg((c) => {
      if (!c) return c;
      const layers = [...c.layers];
      const j = i + dir;
      if (j < 0 || j >= layers.length) return c;
      [layers[i], layers[j]] = [layers[j], layers[i]];
      return { ...c, layers };
    });

  const deleteLayer = (i: number) =>
    setCfg((c) => c ? { ...c, layers: c.layers.filter((_, idx) => idx !== i) } : c);

  const addLayer = () =>
    setCfg((c) => c ? { ...c, layers: [...c.layers, DEFAULT_LAYER()] } : c);

  if (!cfg) return <div className="text-warmgray">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">قسم بوابة التصميم</h1>
          <p className="mt-1 text-sm text-warmgray">تحكم كامل في الصور والزوم والنقاط التوضيحية</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">✓ تم الحفظ</span>}
          <button
            onClick={save} disabled={saving}
            className="rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ كل التغييرات"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General */}
        <Card title="الإعدادات العامة" icon="⚙️">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
            <div>
              <span className="text-sm font-medium text-charcoal">تفعيل القسم</span>
              <p className="text-xs text-warmgray">إظهار / إخفاء القسم في الصفحة الرئيسية</p>
            </div>
            <Toggle enabled={cfg.enabled} onToggle={() => set("enabled", !cfg.enabled)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal">مساحة السكرول</label>
              <input value={cfg.scrollHeight} onChange={(e) => set("scrollHeight", e.target.value)}
                dir="ltr" placeholder="500vh"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
              <p className="mt-1 text-[10px] text-warmgray">أكبر = أبطأ</p>
            </div>
            <ColorInput label="لون الخلفية" value={cfg.bgColor} onChange={(v) => set("bgColor", v)} />
            <ColorInput label="اللون المميز (الذهبي)" value={cfg.accentColor} onChange={(v) => set("accentColor", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal">ظل الحواف (Vignette) 0→1</label>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={1} step={0.02} value={cfg.vignetteOpacity}
                  onChange={(e) => set("vignetteOpacity", Number(e.target.value))} className="flex-1 accent-gold" />
                <span className="w-10 text-center text-sm font-bold text-gold">{cfg.vignetteOpacity}</span>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal">الحبيبات (Grain) 0→0.1</label>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={0.1} step={0.005} value={cfg.grainOpacity}
                  onChange={(e) => set("grainOpacity", Number(e.target.value))} className="flex-1 accent-gold" />
                <span className="w-12 text-center text-sm font-bold text-gold">{cfg.grainOpacity}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Texts */}
        <Card title="النصوص" icon="✍️">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Badge الأعلى" value={cfg.topBadge} onChange={(v) => set("topBadge", v)} />
            <Input label="تلميح السهم ↓" value={cfg.topHint} onChange={(v) => set("topHint", v)} />
          </div>
          <Input label="العنوان الكبير النهائي" value={cfg.finalTitle} onChange={(v) => set("finalTitle", v)} />
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">الجملة تحت العنوان</label>
            <textarea value={cfg.finalSub} rows={2}
              onChange={(e) => set("finalSub", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorInput label="لون العنوان الكبير" value={cfg.finalTitleColor} onChange={(v) => set("finalTitleColor", v)} />
            <Input label="لون الجملة الصغيرة" value={cfg.finalSubColor} onChange={(v) => set("finalSubColor", v)}
              hint='مثال: rgba(255,255,255,0.5)' dir="ltr" />
          </div>
        </Card>

        {/* CTAs */}
        <Card title="الأزرار" icon="🔗">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="نص زر 1" value={cfg.cta1Text} onChange={(v) => set("cta1Text", v)} />
            <Input label="رابط زر 1" value={cfg.cta1Link} onChange={(v) => set("cta1Link", v)} dir="ltr" />
            <ColorInput label="خلفية زر 1" value={cfg.cta1Bg} onChange={(v) => set("cta1Bg", v)} />
            <ColorInput label="نص زر 1" value={cfg.cta1Color} onChange={(v) => set("cta1Color", v)} />
            <Input label="نص زر 2" value={cfg.cta2Text} onChange={(v) => set("cta2Text", v)} />
            <Input label="رابط زر 2" value={cfg.cta2Link} onChange={(v) => set("cta2Link", v)} dir="ltr" />
            <Input label="لون نص زر 2" value={cfg.cta2Color} onChange={(v) => set("cta2Color", v)} dir="ltr"
              hint='مثال: rgba(255,255,255,0.7)' />
          </div>
        </Card>

        {/* Layers */}
        <Card title={`الصور والطبقات (${cfg.layers.length} طبقات)`} icon="🖼️">
          <p className="text-xs text-warmgray -mt-2 mb-4">
            كل طبقة = صورة. الزوم يأخذك من الأولى للأخيرة. أضف أي عدد.
          </p>
          <div className="space-y-4">
            {cfg.layers.map((layer, i) => (
              <LayerCard
                key={layer.id}
                layer={layer}
                index={i}
                total={cfg.layers.length}
                onChange={(l) => updateLayer(i, l)}
                onDelete={() => deleteLayer(i)}
                onMoveUp={() => moveLayer(i, -1)}
                onMoveDown={() => moveLayer(i, 1)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addLayer}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold/40 py-3 text-sm font-medium text-gold/70 transition-colors hover:border-gold hover:bg-gold/5 hover:text-gold"
          >
            + إضافة طبقة جديدة
          </button>
        </Card>
      </div>

      {/* Sticky save */}
      <div className="mt-8 flex items-center gap-4">
        <button onClick={save} disabled={saving}
          className="rounded-lg bg-gold px-8 py-3 text-sm font-medium text-white hover:bg-gold-dark disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "حفظ كل التغييرات"}
        </button>
        {saved && <span className="text-sm text-green-600">✓ تم الحفظ بنجاح</span>}
      </div>
    </div>
  );
}

/* ─── Small UI helpers ─────────────────────────────────────────── */
function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-charcoal">
        <span>{icon}</span>{title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`relative h-7 w-12 rounded-full transition-colors ${enabled ? "bg-green-500" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${enabled ? "right-0.5" : "right-[22px]"}`} />
    </button>
  );
}

function Input({ label, value, onChange, hint, dir }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; dir?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-charcoal">{label}</label>
      <input value={value} dir={dir} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold" />
      {hint && <p className="mt-1 text-[10px] text-warmgray">{hint}</p>}
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-charcoal">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value.startsWith("#") ? value : "#C9A96E"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 cursor-pointer rounded-lg border border-gray-200 p-1" />
        <input value={value} dir="ltr" onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gold" />
      </div>
    </div>
  );
}
