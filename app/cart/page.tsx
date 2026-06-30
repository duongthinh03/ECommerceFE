"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

interface CartItem {
  id: number; productName: string; variantId: number; sku: string;
  quantity: number; price: number; lineTotal: number;
}
interface Cart { id: number; items: CartItem[]; totalQuantity: number; totalAmount: number; }

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<number | null>(null); // variantId đang cập nhật

  async function load() {
    setLoading(true);
    const res = await apiClient<Cart>("/api/cart");
    setCart(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // chạy 1 lần khi mở trang

  // Đổi số lượng: PUT trả về giỏ mới → set thẳng, không cần GET lại
  async function changeQty(variantId: number, quantity: number) {
    setPending(variantId);
    try {
      const res = await apiClient<Cart>(`/api/cart/items/${variantId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      setCart(res.data);
    } finally {
      setPending(null);
    }
  }

  async function remove(variantId: number) {
    setPending(variantId);
    try {
      const res = await apiClient<Cart>(`/api/cart/items/${variantId}`, { method: "DELETE" });
      setCart(res.data);
    } finally {
      setPending(null);
    }
  }

  if (loading)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải giỏ...
      </Container>
    );

  if (!cart || cart.items.length === 0)
    return (
      <Container className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="rounded-full bg-muted p-4">
          <ShoppingCart className="size-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold">Giỏ hàng trống</p>
          <p className="text-muted-foreground">Hãy thêm vài sản phẩm để bắt đầu.</p>
        </div>
        <Link href="/products" className={cn(buttonVariants())}>
          Tiếp tục mua sắm
        </Link>
      </Container>
    );

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Giỏ hàng</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Danh sách item */}
        <div className="space-y-3 lg:col-span-2">
          {cart.items.map((i) => (
            <Card key={i.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{i.productName}</p>
                <p className="text-sm text-muted-foreground">
                  {i.sku} · {formatVND(i.price)}
                </p>
                <div className="mt-2">
                  <QuantityStepper
                    value={i.quantity}
                    onChange={(q) => changeQty(i.variantId, q)}
                    min={1}
                    disabled={pending === i.variantId}
                    size="sm"
                  />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 whitespace-nowrap">
                <span className="font-semibold text-primary">{formatVND(i.lineTotal)}</span>
                <button
                  onClick={() => remove(i.variantId)}
                  disabled={pending === i.variantId}
                  aria-label="Xóa"
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Tóm tắt đơn */}
        <Card className="h-fit p-5">
          <h2 className="font-semibold">Tóm tắt đơn hàng</h2>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>Tạm tính ({cart.totalQuantity} sản phẩm)</span>
            <span>{formatVND(cart.totalAmount)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-bold">
            <span>Tổng</span>
            <span className="text-primary">{formatVND(cart.totalAmount)}</span>
          </div>
          <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}>
            Thanh toán <ArrowRight className="size-4" />
          </Link>
        </Card>
      </div>
    </Container>
  );
}
