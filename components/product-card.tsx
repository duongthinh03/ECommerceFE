import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Product } from "@/lib/types";
import { formatVND, formatCompact } from "@/lib/format";
import { StarRating } from "@/components/star-rating";
import { WishlistHeart } from "@/components/wishlist-heart";

export function ProductCard({ product, showWishlist = true }: { product: Product; showWishlist?: boolean }) {
  const outOfStock = product.inStock === false;

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-lift">
        {/* Ảnh */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {showWishlist && <WishlistHeart productId={product.id} />}
          {product.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="size-10 text-muted-foreground/30" />
            </div>
          )}

          {product.categoryName && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-background/85 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
              {product.categoryName}
            </span>
          )}

          {outOfStock && (
            <>
              <div className="absolute inset-0 bg-background/55" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-foreground/85 px-3 py-1 text-sm font-semibold text-background">
                Hết hàng
              </span>
            </>
          )}
        </div>

        {/* Thông tin */}
        <div className="flex flex-1 flex-col p-3">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          {product.brandName && (
            <p className="mt-0.5 text-xs text-muted-foreground">{product.brandName}</p>
          )}

          {/* Đánh giá + đã bán */}
          {(!!product.reviewCount || !!product.soldCount) && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
              {!!product.reviewCount && product.reviewCount > 0 && (
                <span className="flex items-center gap-1">
                  <StarRating value={Math.round(product.avgRating ?? 0)} size={12} />
                  <span>{(product.avgRating ?? 0).toFixed(1)}</span>
                </span>
              )}
              {!!product.soldCount && product.soldCount > 0 && (
                <>
                  {!!product.reviewCount && product.reviewCount > 0 && <span className="text-border">|</span>}
                  <span>Đã bán {formatCompact(product.soldCount)}</span>
                </>
              )}
            </div>
          )}

          {/* Giá */}
          <div className="mt-auto flex items-baseline gap-1.5 pt-2">
            <span className="text-lg font-bold text-primary">{formatVND(product.displayPrice)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
