"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Gallery cho trang chi tiết: ảnh chính lớn + hàng thumbnail bấm để đổi.
export function ProductImageGallery({ cover, images }: { cover?: string | null; images: string[] }) {
  // gộp cover (bìa) + ảnh phụ, cover đứng đầu, bỏ trùng
  const all = [cover, ...images].filter(Boolean) as string[];
  const unique = Array.from(new Set(all));
  const [main, setMain] = useState<string | null>(unique[0] ?? null);

  if (!main)
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-border bg-muted">
        <ImageIcon className="size-16 text-muted-foreground/40" />
      </div>
    );

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main} alt="Ảnh sản phẩm" className="h-full w-full object-cover" />
      </div>
      {unique.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {unique.map((url) => (
            <button
              key={url}
              onClick={() => setMain(url)}
              className={cn(
                "size-16 overflow-hidden rounded-lg border-2 transition-colors",
                main === url ? "border-primary" : "border-transparent hover:border-input"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
