"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldAlert, Plus, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn, isStaff } from "@/lib/auth";
import { Product } from "@/lib/types";
import { formatVND } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [denied, setDenied] = useState(false);

  async function load() {
    const r = await apiClient<Product[]>("/api/products");
    setProducts(r.data);
  }

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login?redirect=/admin/products"); return; }
    if (!isStaff()) { setDenied(true); return; }
    load();
  }, [router]);

  async function remove(id: number, name: string) {
    if (!confirm(`Xóa sản phẩm "${name}"?`)) return;
    try {
      await apiClient(`/api/products/${id}`, { method: "DELETE" });
      setProducts((p) => p?.filter((x) => x.id !== id) ?? null);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (denied)
    return (
      <Container className="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
        <ShieldAlert className="size-10" />
        <p className="text-lg font-semibold text-foreground">Không có quyền truy cập</p>
      </Container>
    );

  if (!products)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải sản phẩm...
      </Container>
    );

  return (
    <Container className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sản phẩm</h1>
          <p className="text-muted-foreground">{products.length} sản phẩm</p>
        </div>
        <Link href="/admin/products/new" className={cn(buttonVariants(), "gap-1.5")}>
          <Plus className="size-4" /> Thêm sản phẩm
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Chưa có sản phẩm nào.
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <Card key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{p.name}</span>
                  {!p.isActive && <Badge variant="secondary">Ẩn</Badge>}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {p.categoryName ?? "—"} · {formatVND(p.displayPrice)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href={`/admin/products/${p.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
                  <Pencil className="size-4" /> Sửa
                </Link>
                <Button variant="outline" size="sm" onClick={() => remove(p.id, p.name)} className="gap-1.5 text-destructive hover:text-destructive">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
