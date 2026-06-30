import { apiGet } from "@/lib/api";
import { Product } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product-card";

export const metadata = { title: "Sản phẩm" };

// Server Component: fetch chạy TRÊN SERVER (không dính CORS)
export default async function ProductsPage() {
  const res = await apiGet<Product[]>("/api/products");
  const products = res.data;

  return (
    <Container className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sản phẩm</h1>
        <p className="text-muted-foreground">{products.length} sản phẩm</p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Chưa có sản phẩm nào.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Container>
  );
}
