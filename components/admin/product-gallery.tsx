"use client";

import { useEffect, useState } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { apiClient, API_URL } from "@/lib/api";
import { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

// Gallery ảnh phụ của sản phẩm — tải 1/nhiều ảnh + xóa. (Ảnh bìa quản lý ở form phía trên.)
export function ProductGallery({ productId }: { productId: string | number }) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const r = await apiClient<ProductImage[]>(`/api/products/${productId}/images`);
    setImages(r.data);
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    setError("");
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch(`${API_URL}/api/upload`, { method: "POST", credentials: "include", body: fd });
        const uj = await up.json();
        if (!up.ok) throw new Error(uj?.message ?? "Tải ảnh thất bại");
        await apiClient(`/api/products/${productId}/images`, {
          method: "POST",
          body: JSON.stringify({ imageUrl: uj.data.url }),
        });
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      e.target.value = "";   // reset để chọn lại cùng file vẫn được
    }
  }

  async function remove(id: number) {
    if (!confirm("Xóa ảnh này?")) return;
    try {
      await apiClient(`/api/products/${productId}/images/${id}`, { method: "DELETE" });
      setImages((imgs) => imgs.filter((x) => x.id !== id));
    } catch (e) {
      alert((e as Error).message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.imageUrl} alt="" className="h-full w-full object-cover" />
            <button
              onClick={() => remove(img.id)}
              title="Xóa"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}

        <label
          className={cn(
            "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input text-muted-foreground transition-colors hover:bg-accent",
            busy && "pointer-events-none opacity-50"
          )}
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          <span className="text-xs">{busy ? "Đang tải..." : "Thêm ảnh"}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} disabled={busy} />
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">Tải 1 hoặc nhiều ảnh cùng lúc. Bấm 🗑 để xóa.</p>
    </div>
  );
}
