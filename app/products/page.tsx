import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Product, Category } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product-card";

export const metadata = { title: "Sản phẩm" };

// Server Component: fetch chạy TRÊN SERVER (không dính CORS)
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const res = await apiGet<Product[]>("/api/products");
  let products = res.data;
  let title = "Sản phẩm";

  // lọc theo danh mục (client của storefront lọc phía server, list nhỏ nên OK)
  if (category) {
    const cid = Number(category);
    const cats = await apiGet<Category[]>("/api/categories").catch(() => null);
    title = cats?.data.find((c) => c.id === cid)?.name ?? "Sản phẩm";
    products = products.filter((p) => p.categoryId === cid);
  }

  return (
    <Container className="py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{products.length} sản phẩm</p>
        </div>
        {category && (
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            ← Tất cả sản phẩm
          </Link>
        )}
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
