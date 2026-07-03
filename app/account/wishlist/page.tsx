"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Heart, X } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist-context";
import { Product } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
  const router = useRouter();
  const { toggle } = useWishlist();
  const [items, setItems] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login?redirect=/account/wishlist");
      return;
    }
    apiClient<Product[]>("/api/wishlist").then((r) => setItems(r.data)).catch(() => setItems([]));
  }, [router]);

  async function remove(productId: number) {
    setItems((cur) => cur?.filter((p) => p.id !== productId) ?? null); // optimistic
    try {
      await toggle(productId); // đồng bộ luôn với context (tim ở nơi khác)
    } catch {
      apiClient<Product[]>("/api/wishlist").then((r) => setItems(r.data)).catch(() => {}); // lỗi → tải lại
    }
  }

  if (!items)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải danh sách yêu thích...
      </Container>
    );

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Sản phẩm yêu thích</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <Heart className="size-8" />
          <p>Bạn chưa lưu sản phẩm nào.</p>
          <Link href="/products" className={cn(buttonVariants(), "mt-2")}>
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="relative">
              <button
                onClick={() => remove(p.id)}
                aria-label="Bỏ yêu thích"
                className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-soft transition-colors hover:text-destructive"
              >
                <X className="size-4" />
              </button>
              <ProductCard product={p} showWishlist={false} />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
