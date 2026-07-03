import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Product } from "@/lib/types";
import { formatVND } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { WishlistHeart } from "@/components/wishlist-heart";

export function ProductCard({ product, showWishlist = true }: { product: Product; showWishlist?: boolean }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lift">
        {/* Ảnh: dùng thumbnail nếu có, không thì placeholder */}
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
            <Badge
              variant="secondary"
              className="absolute left-3 top-3 bg-background/85 font-normal backdrop-blur"
            >
              {product.categoryName}
            </Badge>
          )}
          {product.inStock === false && (
            <>
              <div className="absolute inset-0 bg-background/55" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-foreground/85 px-3 py-1 text-sm font-semibold text-background">
                Hết hàng
              </span>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="line-clamp-2 font-medium leading-snug transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          {product.brandName && (
            <p className="text-xs text-muted-foreground">{product.brandName}</p>
          )}
          {!!product.reviewCount && product.reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <StarRating value={Math.round(product.avgRating ?? 0)} size={13} />
              <span>({product.reviewCount})</span>
            </div>
          )}
          <p className="mt-auto pt-1 text-lg font-bold text-primary">
            {formatVND(product.displayPrice)}
          </p>
        </div>
      </article>
    </Link>
  );
}
