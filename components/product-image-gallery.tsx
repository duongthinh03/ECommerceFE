"use client";

import { useEffect, useState, useCallback } from "react";
import { ImageIcon, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Gallery chi tiết: ảnh chính + strip thumbnail + bấm ảnh để phóng to toàn màn hình (lightbox).
export function ProductImageGallery({ cover, images }: { cover?: string | null; images: string[] }) {
  const all = [cover, ...images].filter(Boolean) as string[];
  const unique = Array.from(new Set(all));
  const count = unique.length;

  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);

  const prev = useCallback(() => setIdx((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIdx((i) => (i + 1) % count), [count]);

  // Khi phóng to: phím ← → chuyển ảnh, Esc đóng, khóa cuộn nền
  useEffect(() => {
    if (!zoom) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoom(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom, prev, next]);

  if (count === 0)
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-border bg-muted">
        <ImageIcon className="size-16 text-muted-foreground/40" />
      </div>
    );

  const current = unique[idx];

  return (
    <div className="space-y-3">
      {/* Ảnh chính — bấm để phóng to */}
      <button
        type="button"
        onClick={() => setZoom(true)}
        className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted"
        title="Bấm để phóng to"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt="Ảnh sản phẩm" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3.5" /> Phóng to
        </span>
      </button>

      {/* Thumbnail strip */}
      {count > 1 && (
        <div className="flex flex-wrap gap-2">
          {unique.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "size-16 overflow-hidden rounded-lg border-2 transition-colors",
                i === idx ? "border-primary" : "border-transparent hover:border-input"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox toàn màn hình */}
      {zoom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Đóng"
          >
            <X className="size-6" />
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="size-7" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                aria-label="Ảnh sau"
              >
                <ChevronRight className="size-7" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt="Ảnh phóng to"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {count > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
              {idx + 1} / {count}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
