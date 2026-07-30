import { apiGet } from "@/lib/api";
import { Product, Category, Paged } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { Pagination } from "@/components/pagination";

export const metadata = { title: "Sản phẩm" };

const PAGE_SIZE = 12;

type SP = {
  q?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sort?: string;
  page?: string;
};

// Server Component: fetch chạy TRÊN SERVER (không dính CORS)
export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;

  // ---- dựng query gửi BE (FE dùng "category", BE nhận "categoryId") ----
  const beParams = new URLSearchParams();
  if (sp.q) beParams.set("q", sp.q);
  if (sp.category) beParams.set("categoryId", sp.category);
  if (sp.minPrice) beParams.set("minPrice", sp.minPrice);
  if (sp.maxPrice) beParams.set("maxPrice", sp.maxPrice);
  if (sp.inStock === "true") beParams.set("inStock", "true");
  if (sp.sort) beParams.set("sort", sp.sort);
  const page = Math.max(1, Number(sp.page) || 1);
  beParams.set("page", String(page));
  beParams.set("pageSize", String(PAGE_SIZE));

  const [res, cats] = await Promise.all([
    apiGet<Paged<Product>>(`/api/products?${beParams}`),
    apiGet<Category[]>("/api/categories").catch(() => null),
  ]);
  const paged = res.data;
  const categories = cats?.data ?? [];

  // giữ nguyên filter khi đổi trang
  const pageLink = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") params.set(k, v);
    params.set("page", String(p));
    return `/products?${params}`;
  };

  return (
    <Container className="py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Sản phẩm</h1>
        <p className="text-muted-foreground">{paged.totalCount} kết quả</p>
      </div>

      <ProductFilters categories={categories} />

      {paged.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {paged.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <Pagination page={page} totalPages={paged.totalPages} hrefFor={pageLink} />
        </>
      )}
    </Container>
  );
}
