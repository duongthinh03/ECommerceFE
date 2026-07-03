import Link from "next/link";
import { ChevronRight, Truck, RotateCcw, ShieldCheck, Lock } from "lucide-react";
import { apiGet } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import { formatCompact } from "@/lib/format";
import { Product, Variant, ProductImage } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { StarRating } from "@/components/star-rating";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ProductReviews } from "@/components/product-reviews";
import { WishlistButton } from "@/components/wishlist-button";
import VariantSelector from "./VariantSelector";

const benefits = [
  { icon: Truck, text: "Giao nhanh toàn quốc" },
  { icon: RotateCcw, text: "Đổi trả trong 7 ngày" },
  { icon: ShieldCheck, text: "Hàng chính hãng" },
  { icon: Lock, text: "Thanh toán an toàn" },
];

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
    <Container className="py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Trang chủ</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/products" className="hover:text-foreground">Sản phẩm</Link>
        {product.categoryName && (
          <>
            <ChevronRight className="size-3.5" />
            <Link href={`/products?category=${product.categoryId}`} className="hover:text-foreground">
              {product.categoryName}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="max-w-[16rem] truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Ảnh — sticky khi cuộn trên desktop */}
        <div className="md:sticky md:top-24 md:self-start">
          <ProductImageGallery cover={product.thumbnail} images={images.map((i) => i.imageUrl)} />
        </div>

        {/* Thông tin + chọn variant */}
        <div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{product.name}</h1>
          {product.brandName && (
            <p className="mt-1 text-sm text-muted-foreground">
              Thương hiệu: <span className="font-medium text-foreground">{product.brandName}</span>
            </p>
          )}

          {/* Đánh giá + đã bán */}
          {(!!product.reviewCount || !!product.soldCount) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {!!product.reviewCount && product.reviewCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <StarRating value={Math.round(product.avgRating ?? 0)} size={16} />
                  <span className="font-semibold">{(product.avgRating ?? 0).toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.reviewCount} đánh giá)</span>
                </span>
              )}
              {!!product.soldCount && product.soldCount > 0 && (
                <span className="text-muted-foreground">
                  <span className="mr-3 text-border">|</span>Đã bán {formatCompact(product.soldCount)}
                </span>
              )}
            </div>
          )}

          {/* Server fetch xong → truyền variants xuống Client Component để tương tác */}
          <VariantSelector variants={variants} productName={product.name} productThumbnail={product.thumbnail} />

          <div className="mt-4">
            <WishlistButton productId={id} />
          </div>

          {/* Dải tiện ích / cam kết */}
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-4">
            {benefits.map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-sm">
                <b.icon className="size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{b.text}</span>
              </div>
            ))}
          </div>

          {/* Mô tả */}
          {product.description && (
            <div className="mt-6 border-t border-border pt-6">
              <h2 className="mb-2 font-semibold">Mô tả sản phẩm</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Đánh giá sản phẩm (client — tự tải, cần cookie để biết đã mua) */}
      <ProductReviews productId={id} />
    </Container>
  );
}
