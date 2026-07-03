"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, ArrowRight, Loader2, ImageIcon, ShieldCheck } from "lucide-react";
import { apiClient } from "@/lib/api";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

interface CartItem {
  id: number; productName: string; variantId: number; sku: string;
  quantity: number; price: number; lineTotal: number; stock: number;
  thumbnail?: string | null;
}
interface Cart { id: number; items: CartItem[]; totalQuantity: number; totalAmount: number; }

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  async function load() {
    setLoading(true);
    const res = await apiClient<Cart>("/api/cart");
    setCart(res.data);
    const ids = res.data.items.map((i) => i.variantId);
    // mặc định KHÔNG tích gì; chỉ giữ lại lựa chọn hiện có (bỏ item đã xóa)
    setSelected((cur) => new Set([...cur].filter((v) => ids.includes(v))));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function changeQty(variantId: number, quantity: number) {
    setPending(variantId);
    try {
      const res = await apiClient<Cart>(`/api/cart/items/${variantId}`, { method: "PUT", body: JSON.stringify({ quantity }) });
      setCart(res.data);
    } finally { setPending(null); }
  }

  async function remove(variantId: number) {
    setPending(variantId);
    try {
      const res = await apiClient<Cart>(`/api/cart/items/${variantId}`, { method: "DELETE" });
      setCart(res.data);
      setSelected((s) => { const n = new Set(s); n.delete(variantId); return n; });
    } finally { setPending(null); }
  }

  function toggle(variantId: number) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(variantId)) n.delete(variantId); else n.add(variantId);
      return n;
    });
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
        <Link href="/products" className={cn(buttonVariants())}>Tiếp tục mua sắm</Link>
      </Container>
    );

  const allSelected = selected.size === cart.items.length;
  const selectedItems = cart.items.filter((i) => selected.has(i.variantId));
  const selCount = selectedItems.reduce((s, i) => s + i.quantity, 0);
  const selTotal = selectedItems.reduce((s, i) => s + i.lineTotal, 0);
  const selStockIssue = selectedItems.some((i) => i.quantity > i.stock);
  const canCheckout = selectedItems.length > 0 && !selStockIssue;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(cart!.items.map((i) => i.variantId)));
  }

  function goCheckout() {
    if (!canCheckout) return;
    sessionStorage.removeItem("buy_now");   // đảm bảo checkout ở chế độ "từ giỏ"
    sessionStorage.setItem("checkout_variants", JSON.stringify([...selected]));
    router.push("/checkout");
  }

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
        Giỏ hàng <span className="text-lg font-normal text-muted-foreground">({cart.items.length})</span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="size-4 accent-primary" />
            Chọn tất cả ({cart.items.length})
          </label>

          {cart.items.map((i) => {
            const isSel = selected.has(i.variantId);
            return (
              <Card
                key={i.id}
                className={cn(
                  "flex gap-3 p-3 transition-colors sm:p-4",
                  isSel ? "border-primary/40 bg-primary/[0.02]" : ""
                )}
              >
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggle(i.variantId)}
                  className="mt-1 size-4 shrink-0 accent-primary"
                  aria-label={`Chọn ${i.productName}`}
                />

                {/* Ảnh sản phẩm (fallback placeholder nếu chưa có) */}
                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {i.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.thumbnail} alt={i.productName} className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center">
                      <ImageIcon className="size-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-medium leading-snug">{i.productName}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{i.sku}</p>
                  <p className="mt-0.5 text-sm font-semibold text-primary">{formatVND(i.price)}</p>
                  <div className="mt-2">
                    <QuantityStepper
                      value={i.quantity}
                      onChange={(q) => changeQty(i.variantId, q)}
                      min={1}
                      max={i.stock > 0 ? i.stock : i.quantity}
                      disabled={pending === i.variantId || i.stock === 0}
                      size="sm"
                    />
                  </div>
                  {i.stock === 0 ? (
                    <p className="mt-1 text-sm font-medium text-destructive">Hết hàng — vui lòng xóa</p>
                  ) : i.quantity > i.stock ? (
                    <p className="mt-1 text-sm font-medium text-destructive">Chỉ còn {i.stock} — giảm số lượng</p>
                  ) : null}
                </div>

                <div className="flex flex-col items-end justify-between whitespace-nowrap">
                  <button
                    onClick={() => remove(i.variantId)}
                    disabled={pending === i.variantId}
                    aria-label="Xóa"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <span className="font-bold text-primary">{formatVND(i.lineTotal)}</span>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="h-fit p-5 lg:sticky lg:top-24">
          <h2 className="font-semibold">Tóm tắt đơn hàng</h2>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground">
            <span>Tạm tính ({selCount} sản phẩm)</span>
            <span>{formatVND(selTotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>Phí vận chuyển</span>
            <span>Tính ở bước thanh toán</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-bold">
            <span>Tổng</span>
            <span className="text-primary">{formatVND(selTotal)}</span>
          </div>

          {selectedItems.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Chọn sản phẩm để thanh toán.</p>
          ) : selStockIssue ? (
            <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Sản phẩm đã chọn hết/vượt tồn. Giảm số lượng hoặc bỏ chọn.
            </p>
          ) : null}

          <Button onClick={goCheckout} disabled={!canCheckout} size="lg" className="mt-5 w-full">
            Thanh toán ({selectedItems.length}) <ArrowRight className="size-4" />
          </Button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Thanh toán an toàn &amp; bảo mật
          </p>
        </Card>
      </div>
    </Container>
  );
}
