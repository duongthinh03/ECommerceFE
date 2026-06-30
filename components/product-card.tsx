import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Product } from "@/lib/types";
import { formatVND } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lift">
        {/* Ảnh: dùng thumbnail nếu có, không thì placeholder */}
        <div className="relative aspect-square overflow-hidden bg-muted">
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
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <h3 className="line-clamp-2 font-medium leading-snug transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          {product.brandName && (
            <p className="text-xs text-muted-foreground">{product.brandName}</p>
          )}
          <p className="mt-auto pt-1 text-lg font-bold text-primary">
            {formatVND(product.displayPrice)}
          </p>
        </div>
      </article>
    </Link>
  );
}
