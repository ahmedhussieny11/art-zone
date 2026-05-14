"use client";

import { useState, useRef, useCallback } from "react";
import PlaceholderImage from "./ui/PlaceholderImage";
import { useSiteLocale } from "@/components/SiteProviders";

interface BeforeAfterSliderProps {
  beforeImage: unknown;
  afterImage: unknown;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({
  beforeImage: _beforeImage,
  afterImage: _afterImage,
  beforeLabel,
  afterLabel,
}: BeforeAfterSliderProps) {
  const { t } = useSiteLocale();
  const b = beforeLabel ?? t("beforeAfter.before");
  const a = afterLabel ?? t("beforeAfter.after");
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setPosition(percent);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  return (
    <div
      ref={containerRef}
      className="relative aspect-[16/10] cursor-col-resize select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      role="slider"
      aria-label={t("beforeAfter.sliderAria")}
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition((p) => Math.max(p - 2, 0));
        if (e.key === "ArrowRight") setPosition((p) => Math.min(p + 2, 100));
      }}
    >
      {/* After (full background) */}
      <PlaceholderImage className="absolute inset-0 h-full w-full" label={a} />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <PlaceholderImage
          className="h-full w-full brightness-75"
          label={b}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white"
        style={{ left: `${position}%` }}
      >
        {/* Handle */}
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-charcoal/70 backdrop-blur-sm">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l-3 3m0 0l3 3m-3-3h18M16 9l3 3m0 0l-3 3"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute right-4 top-4 z-10 bg-charcoal/60 px-3 py-1 text-xs font-medium tracking-widest text-white backdrop-blur-sm">
        {b}
      </span>
      <span className="absolute left-4 top-4 z-10 bg-charcoal/60 px-3 py-1 text-xs font-medium tracking-widest text-white backdrop-blur-sm">
        {a}
      </span>
    </div>
  );
}
