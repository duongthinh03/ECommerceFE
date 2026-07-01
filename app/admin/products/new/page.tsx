"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn, isStaff } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";

export default function NewProductPage() {
  const router = useRouter();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login?redirect=/admin/products/new"); return; }
    if (!isStaff()) setDenied(true);
  }, [router]);

  async function create(v: ProductFormValues) {
    await apiClient("/api/products", {
      method: "POST",
      body: JSON.stringify({
        ...v,
        brandId: null,
        description: v.description || null,
        thumbnail: v.thumbnail || null,
      }),
    });
    router.push("/admin/products");
  }

  if (denied)
    return (
      <Container className="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
        <ShieldAlert className="size-10" />
        <p className="text-lg font-semibold text-foreground">Không có quyền truy cập</p>
      </Container>
    );

  return (
    <Container className="max-w-2xl py-8">
      <Link href="/admin/products" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Danh sách sản phẩm
      </Link>
      <Card>
        <CardHeader><CardTitle>Thêm sản phẩm</CardTitle></CardHeader>
        <CardContent>
          <ProductForm onSubmit={create} submitLabel="Tạo sản phẩm" />
        </CardContent>
      </Card>
    </Container>
  );
}
