import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import { Product, Variant, ProductImage } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ProductReviews } from "@/components/product-reviews";
import { WishlistButton } from "@/components/wishlist-button";
import VariantSelector from "./VariantSelector";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const product = (await apiGet<Product>(`/api/products/${id}`)).data;
    const desc = product.description?.slice(0, 160) || `Mua ${product.name} chính hãng tại ShopViet.`;
    return {
      title: product.name,
      description: desc,
      alternates: { canonical: `/products/${id}` },
      openGraph: {
        title: product.name,
        description: desc,
        images: product.thumbnail ? [product.thumbnail] : undefined,
      },
    };
  } catch {
    return { title: "Sản phẩm" };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Next 16: params là Promise, phải await

  const product = (await apiGet<Product>(`/api/products/${id}`)).data;
  const variants = (await apiGet<Variant[]>(`/api/products/${id}/variants`)).data;
  const images = await apiGet<ProductImage[]>(`/api/products/${id}/images`).then((r) => r.data).catch(() => []);

  // Structured data (schema.org/Product) → Google hiển thị giá + sao trong kết quả tìm kiếm
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.thumbnail ? { image: [product.thumbnail] } : {}),
    ...(product.description ? { description: product.description } : {}),
    ...(product.brandName ? { brand: { "@type": "Brand", name: product.brandName } } : {}),
    offers: {
      "@type": "Offer",
      price: product.displayPrice,
      priceCurrency: "VND",
      availability: product.inStock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${SITE_URL}/products/${id}`,
    },
    ...(product.reviewCount
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.avgRating, reviewCount: product.reviewCount } }
      : {}),
  };

  return (
    <Container className="py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Tất cả sản phẩm
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Ảnh sản phẩm — gallery (bìa + ảnh phụ) */}
        <ProductImageGallery cover={product.thumbnail} images={images.map((i) => i.imageUrl)} />

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

          <div className="mt-4">
            <WishlistButton productId={id} />
          </div>
        </div>
      </div>

      {/* Đánh giá sản phẩm (client — tự tải, cần cookie để biết đã mua) */}
      <ProductReviews productId={id} />
    </Container>
  );
}
