"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Product } from "@/lib/types";

interface WishlistCtx {
  ids: Set<number>;
  ready: boolean;
  has: (id: number) => boolean;
  toggle: (id: number) => Promise<void>;
}

const Ctx = createContext<WishlistCtx | null>(null);

// Nạp 1 lần danh sách id yêu thích của user, chia sẻ cho toàn app
// (tim trên product-card, nút ở trang chi tiết, trang /account/wishlist đều đọc chung).
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    if (!isLoggedIn()) { setReady(true); return; }
    try {
      const r = await apiClient<Product[]>("/api/wishlist");
      setIds(new Set(r.data.map((p) => p.id)));
    } catch {
      /* im lặng — tim chỉ là phụ trợ UI */
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const has = useCallback((id: number) => ids.has(id), [ids]);

  const toggle = useCallback(async (id: number) => {
    const adding = !ids.has(id);
    setIds((s) => {
      const n = new Set(s);
      if (adding) n.add(id); else n.delete(id);
      return n;
    });
    try {
      await apiClient(`/api/wishlist/${id}`, { method: adding ? "POST" : "DELETE" });
    } catch (e) {
      setIds((s) => {   // revert khi lỗi
        const n = new Set(s);
        if (adding) n.delete(id); else n.add(id);
        return n;
      });
      throw e;
    }
  }, [ids]);

  return <Ctx.Provider value={{ ids, ready, has, toggle }}>{children}</Ctx.Provider>;
}

export function useWishlist() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWishlist phải nằm trong <WishlistProvider>");
  return c;
}
