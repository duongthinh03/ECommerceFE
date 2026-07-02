"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  className,
}: {
  productId: number | string;
  className?: string;
}) {
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) return;
    apiClient<Product[]>("/api/wishlist")
      .then((r) => setFav(r.data.some((p) => String(p.id) === String(productId))))
      .catch(() => {});
  }, [productId]);

  async function toggle() {
    if (!isLoggedIn()) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !fav;
    setFav(next); // optimistic
    try {
      await apiClient(`/api/wishlist/${productId}`, { method: next ? "POST" : "DELETE" });
    } catch (e) {
      setFav(!next); // revert
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={fav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50",
        fav && "border-rose-200 text-rose-600",
        className
      )}
    >
      <Heart className={cn("size-4", fav && "fill-rose-500 text-rose-500")} />
      {fav ? "Đã thích" : "Yêu thích"}
    </button>
  );
}
