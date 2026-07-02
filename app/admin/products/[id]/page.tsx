"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldAlert, Loader2, Trash2, Plus } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn, isStaff } from "@/lib/auth";
import { Product, Variant } from "@/lib/types";
import { formatVND } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { ProductGallery } from "@/components/admin/product-gallery";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [denied, setDenied] = useState(false);
  const [saved, setSaved] = useState("");
  const [newV, setNewV] = useState({ sku: "", optionName: "", price: 0, stock: 0 });
  const [addErr, setAddErr] = useState("");

  async function loadVariants() {
    const r = await apiClient<Variant[]>(`/api/products/${id}/variants`);
    setVariants(r.data);
  }

  useEffect(() => {
    if (!isLoggedIn()) { router.push(`/login?redirect=/admin/products/${id}`); return; }
    if (!isStaff()) { setDenied(true); return; }
    apiClient<Product>(`/api/products/${id}`).then((r) => setProduct(r.data)).catch(() => setProduct(null));
    loadVariants().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, id]);

  async function save(v: ProductFormValues) {
    await apiClient(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...v,
        brandId: product?.brandId ?? null,
        description: v.description || null,
        thumbnail: v.thumbnail || null,
      }),
    });
    setSaved("Đã lưu sản phẩm");
  }

  async function addVariant(e: React.FormEvent) {
    e.preventDefault();
    setAddErr("");
    try {
      await apiClient(`/api/products/${id}/variants`, {
        method: "POST",
        body: JSON.stringify({ sku: newV.sku, optionName: newV.optionName || null, price: newV.price, stock: newV.stock, isActive: true }),
      });
      setNewV({ sku: "", optionName: "", price: 0, stock: 0 });
      await loadVariants();
    } catch (e) {
      setAddErr((e as Error).message);
    }
  }

  async function removeVariant(vid: number, sku: string) {
    if (!confirm(`Xóa biến thể "${sku}"?`)) return;
    try {
      await apiClient(`/api/products/${id}/variants/${vid}`, { method: "DELETE" });
      setVariants((vs) => vs.filter((x) => x.id !== vid));
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

  if (!product)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải...
      </Container>
    );

  return (
    <Container className="max-w-3xl py-8">
      <Link href="/admin/products" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Danh sách sản phẩm
      </Link>

      <div className="grid gap-6 md:grid-cols-5">
        <div className="space-y-6 md:col-span-3">
          <Card>
            <CardHeader><CardTitle>Sửa sản phẩm</CardTitle></CardHeader>
            <CardContent>
              <ProductForm
                initial={{
                  name: product.name, slug: product.slug, description: product.description ?? "",
                  categoryId: product.categoryId, displayPrice: product.displayPrice,
                  thumbnail: product.thumbnail ?? "", isActive: product.isActive,
                }}
                onSubmit={save}
                submitLabel="Lưu thay đổi"
              />
              {saved && <p className="mt-3 text-sm text-success">{saved}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Biến thể + Thư viện ảnh — đều TỰ LƯU ngay, không cần bấm "Lưu thay đổi" */}
        <div className="space-y-6 md:col-span-2">
          <Card className="h-fit">
            <CardHeader><CardTitle>Biến thể (SKU)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {variants.length === 0 && <p className="text-sm text-muted-foreground">Chưa có biến thể.</p>}
              {variants.map((vr) => (
                <div key={vr.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{vr.optionName || vr.sku}</p>
                    <p className="text-muted-foreground">
                      {vr.optionName ? `${vr.sku} · ` : ""}{formatVND(vr.price)} · Kho {vr.stock}
                      {!vr.isActive && <Badge variant="secondary" className="ml-1">Ẩn</Badge>}
                    </p>
                  </div>
                  <button onClick={() => removeVariant(vr.id, vr.sku)} className="text-destructive hover:opacity-70" aria-label="Xóa">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <form onSubmit={addVariant} className="space-y-2 border-t border-border pt-3">
                <Label className="text-xs text-muted-foreground">Thêm biến thể</Label>
                <Input placeholder="SKU" value={newV.sku} required onChange={(e) => setNewV({ ...newV, sku: e.target.value })} />
                <Input placeholder={`Nhãn (vd "3U", "Đỏ / 42")`} value={newV.optionName} onChange={(e) => setNewV({ ...newV, optionName: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" min={0} placeholder="Giá" value={newV.price} required onChange={(e) => setNewV({ ...newV, price: Number(e.target.value) })} />
                  <Input type="number" min={0} placeholder="Kho" value={newV.stock} required onChange={(e) => setNewV({ ...newV, stock: Number(e.target.value) })} />
                </div>
                {addErr && <p className="text-sm text-destructive">{addErr}</p>}
                <Button type="submit" variant="outline" size="sm" className="w-full gap-1.5">
                  <Plus className="size-4" /> Thêm
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader><CardTitle>Thư viện ảnh (ảnh phụ)</CardTitle></CardHeader>
            <CardContent>
              <ProductGallery productId={id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
