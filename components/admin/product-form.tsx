"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Category } from "@/lib/types";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface ProductFormValues {
  name: string;
  slug: string;
  description: string;
  categoryId: number;
  displayPrice: number;
  thumbnail: string;
  isActive: boolean;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function ProductForm({
  initial, onSubmit, submitLabel,
}: {
  initial?: Partial<ProductFormValues>;
  onSubmit: (v: ProductFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [cats, setCats] = useState<Category[]>([]);
  const [autoSlug, setAutoSlug] = useState(!initial?.slug);
  const [v, setV] = useState<ProductFormValues>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.categoryId ?? 0,
    displayPrice: initial?.displayPrice ?? 0,
    thumbnail: initial?.thumbnail ?? "",
    isActive: initial?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient<Category[]>("/api/categories")
      .then((r) => {
        setCats(r.data);
        setV((prev) => (prev.categoryId ? prev : { ...prev, categoryId: r.data[0]?.id ?? 0 }));
      })
      .catch(() => {});
  }, []);

  function setName(name: string) {
    setV((prev) => ({ ...prev, name, slug: autoSlug ? slugify(name) : prev.slug }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(v);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Tên sản phẩm</Label>
        <Input id="name" value={v.name} required onChange={(e) => setName(e.target.value)} placeholder="Áo thun nam" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (đường dẫn)</Label>
        <Input
          id="slug"
          value={v.slug}
          required
          onChange={(e) => { setAutoSlug(false); setV({ ...v, slug: e.target.value }); }}
          placeholder="ao-thun-nam"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Danh mục</Label>
          <select
            id="categoryId"
            value={v.categoryId}
            onChange={(e) => setV({ ...v, categoryId: Number(e.target.value) })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="displayPrice">Giá hiển thị (đ)</Label>
          <Input
            id="displayPrice"
            type="number"
            min={0}
            value={v.displayPrice}
            required
            onChange={(e) => setV({ ...v, displayPrice: Number(e.target.value) })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="thumbnail">Ảnh (URL)</Label>
        <Input id="thumbnail" value={v.thumbnail} onChange={(e) => setV({ ...v, thumbnail: e.target.value })} placeholder="https://..." />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={v.isActive} onChange={(e) => setV({ ...v, isActive: e.target.checked })} className="size-4 accent-primary" />
        Đang bán (hiển thị trên web)
      </label>

      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Đang lưu..." : submitLabel}
      </Button>
    </form>
  );
}
