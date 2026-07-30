"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Product, Paged } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

// Feed "Sản phẩm mới" ở trang chủ (kiểu Shopee): trang đầu render sẵn từ server,
// bấm "Xem thêm" tải trang kế phía client rồi NỐI thêm vào danh sách.
export function ProductFeed({ initial }: { initial: Paged<Product> }) {
  const [items, setItems] = useState<Product[]>(initial.items);
  const [page, setPage] = useState(initial.page);
  const [hasNext, setHasNext] = useState(initial.hasNext);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (loading || !hasNext) return;
    setLoading(true);
    try {
      const next = page + 1;
      // dùng đúng pageSize server đã trả để nối trang không lệch/lặp
      const res = await apiClient<Paged<Product>>(
        `/api/products?pageSize=${initial.pageSize}&page=${next}`
      );
      setItems((prev) => [...prev, ...res.data.items]);
      setPage(res.data.page);
      setHasNext(res.data.hasNext);
    } catch {
      // nuốt lỗi nhẹ: giữ nút để người dùng thử lại
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {hasNext && (
        <div className="mt-8 flex justify-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="min-w-40 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Đang tải...
              </>
            ) : (
              "Xem thêm"
            )}
          </Button>
        </div>
      )}
    </>
  );
}
