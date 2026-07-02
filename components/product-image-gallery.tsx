"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ImageIcon, X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

// Gallery chi tiết: ảnh chính + thumbnail + lightbox toàn màn hình có zoom to/nhỏ + kéo xem.
export function ProductImageGallery({ cover, images }: { cover?: string | null; images: string[] }) {
  const all = [cover, ...images].filter(Boolean) as string[];
  const unique = Array.from(new Set(all));
  const count = unique.length;

  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const reset = useCallback(() => { setScale(1); setOffset({ x: 0, y: 0 }); }, []);
  const prev = useCallback(() => { setIdx((i) => (i - 1 + count) % count); reset(); }, [count, reset]);
  const next = useCallback(() => { setIdx((i) => (i + 1) % count); reset(); }, [count, reset]);
  const zoomIn = useCallback(() => setScale((s) => Math.min(s + 0.5, 4)), []);
  const zoomOut = useCallback(() => setScale((s) => {
    const n = Math.max(s - 0.5, 1);
    if (n === 1) setOffset({ x: 0, y: 0 });
    return n;
  }), []);

  // phím tắt khi mở lightbox
  useEffect(() => {
    if (!zoom) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoom(false);
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [zoom, prev, next, zoomIn, zoomOut]);

  if (count === 0)
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-border bg-muted">
        <ImageIcon className="size-16 text-muted-foreground/40" />
      </div>
    );

  const current = unique[idx];

  // kéo để xem (chỉ khi đã zoom > 1)
  function onMouseDown(e: React.MouseEvent) {
    if (scale <= 1) return;
    e.preventDefault();
    drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!drag.current) return;
    setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  }
  function endDrag() { drag.current = null; }

  function onWheel(e: React.WheelEvent) {
    if (e.deltaY < 0) zoomIn(); else zoomOut();
  }

  return (
    <div className="space-y-3">
      {/* Ảnh chính — bấm để phóng to */}
      <button
        type="button"
        onClick={() => { reset(); setZoom(true); }}
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

      {/* Lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/90 p-4"
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
            draggable={false}
            className="max-h-full max-w-full select-none object-contain"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              cursor: scale > 1 ? (drag.current ? "grabbing" : "grab") : "zoom-in",
            }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => { e.stopPropagation(); scale > 1 ? reset() : setScale(2); }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onWheel={onWheel}
          />

          {/* Thanh zoom + đếm ảnh */}
          <div
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={zoomOut} disabled={scale <= 1} className="disabled:opacity-40" aria-label="Thu nhỏ">
              <ZoomOut className="size-5" />
            </button>
            <span className="w-12 text-center tabular-nums">{Math.round(scale * 100)}%</span>
            <button type="button" onClick={zoomIn} disabled={scale >= 4} className="disabled:opacity-40" aria-label="Phóng to">
              <ZoomIn className="size-5" />
            </button>
            {count > 1 && (
              <span className="ml-1 border-l border-white/25 pl-3 tabular-nums">{idx + 1} / {count}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
