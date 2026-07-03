"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { isLoggedIn } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist-context";
import { cn } from "@/lib/utils";

// Tim nhỏ đặt trên góc ảnh product-card. Card là <Link> nên phải chặn điều hướng khi bấm.
export function WishlistHeart({ productId }: { productId: number }) {
  const router = useRouter();
  const { has, toggle } = useWishlist();
  const fav = has(productId);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn()) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }
    try {
      await toggle(productId);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <button
      onClick={onClick}
      aria-label={fav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      className="absolute right-2.5 top-2.5 z-10 grid size-8 place-items-center rounded-full bg-background/85 text-muted-foreground shadow-soft backdrop-blur transition-colors hover:text-rose-500"
    >
      <Heart className={cn("size-4", fav && "fill-rose-500 text-rose-500")} />
    </button>
  );
}
