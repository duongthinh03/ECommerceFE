import Link from "next/link";
import { ChevronLeft, ImageIcon } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Product, Variant } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import VariantSelector from "./VariantSelector";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = (await apiGet<Product>(`/api/products/${id}`)).data;
    return { title: product.name };
  } catch {
    return { title: "Sản phẩm" };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Next 16: params là Promise, phải await

  const product = (await apiGet<Product>(`/api/products/${id}`)).data;
  const variants = (await apiGet<Variant[]>(`/api/products/${id}/variants`)).data;

  return (
    <Container className="py-8">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Tất cả sản phẩm
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Ảnh sản phẩm */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {product.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="size-16 text-muted-foreground/40" />
          )}
        </div>

        {/* Thông tin + chọn variant */}
        <div>
          {product.categoryName && (
            <Badge variant="secondary" className="mb-2 font-normal">
              {product.categoryName}
            </Badge>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          {product.brandName && (
            <p className="mt-1 text-sm text-muted-foreground">Thương hiệu: {product.brandName}</p>
          )}
          {product.description && (
            <p className="mt-4 leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          {/* Server fetch xong → truyền variants xuống Client Component để tương tác */}
          <VariantSelector variants={variants} />
        </div>
      </div>
    </Container>
  );
}
