import type { MetadataRoute } from "next";
import { apiGet } from "@/lib/api";
import { Product, Category, Paged } from "@/lib/types";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600; // sinh lại tối đa mỗi giờ

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
  ];

  // Sản phẩm + danh mục — lỗi API thì vẫn trả các route tĩnh
  const [prods, cats] = await Promise.all([
    apiGet<Paged<Product>>("/api/products?pageSize=1000").then((r) => r.data.items).catch(() => [] as Product[]),
    apiGet<Category[]>("/api/categories").then((r) => r.data).catch(() => [] as Category[]),
  ]);

  const productRoutes: MetadataRoute.Sitemap = prods.map((p) => ({
    url: `${SITE_URL}/products/${p.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${SITE_URL}/products?category=${c.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
