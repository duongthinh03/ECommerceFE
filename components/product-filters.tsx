"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Category } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  // giá trị hiện tại lấy từ URL (nguồn sự thật duy nhất)
  const get = (k: string) => sp.get(k) ?? "";

  function apply(form: HTMLFormElement) {
    const fd = new FormData(form);
    const params = new URLSearchParams();
    for (const key of ["q", "category", "minPrice", "maxPrice", "sort"]) {
      const v = (fd.get(key) as string | null)?.trim();
      if (v) params.set(key, v);
    }
    if (fd.get("inStock")) params.set("inStock", "true");
    // đổi bộ lọc → luôn về trang 1
    router.push(`/products${params.toString() ? `?${params}` : ""}`);
  }

  function clearAll() {
    router.push("/products");
  }

  const hasFilter = ["q", "category", "minPrice", "maxPrice", "inStock", "sort"].some((k) => sp.get(k));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
      className="mb-6 space-y-3 rounded-xl border border-border bg-card p-4 shadow-soft"
    >
      {/* dòng tìm kiếm */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={get("q")} placeholder="Tìm sản phẩm theo tên..." className="pl-9" />
        </div>
        <Button type="submit" className="gap-1.5">
          <Search className="size-4" /> Tìm
        </Button>
      </div>

      {/* dòng bộ lọc */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select name="category" defaultValue={get("category")} className={selectCls}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <Input name="minPrice" type="number" min={0} defaultValue={get("minPrice")} placeholder="Giá từ" />
        <Input name="maxPrice" type="number" min={0} defaultValue={get("maxPrice")} placeholder="Giá đến" />

        <select name="sort" defaultValue={get("sort")} className={selectCls}>
          <option value="">Mới nhất</option>
          <option value="price_asc">Giá: thấp → cao</option>
          <option value="price_desc">Giá: cao → thấp</option>
        </select>

        <label className="flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm">
          <input type="checkbox" name="inStock" value="true" defaultChecked={sp.get("inStock") === "true"} className="size-4 accent-primary" />
          Chỉ còn hàng
        </label>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" variant="outline" size="sm">Áp dụng bộ lọc</Button>
        {hasFilter && (
          <button type="button" onClick={clearAll} className={cn("inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground")}>
            <X className="size-3.5" /> Xóa lọc
          </button>
        )}
      </div>
    </form>
  );
}
