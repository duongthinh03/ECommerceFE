"use client"; // chạy trên BROWSER (dùng được state + sự kiện)

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingCart, AlertCircle, Zap } from "lucide-react";
import { Variant } from "@/lib/types";
import { apiClient } from "@/lib/api";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

export default function VariantSelector({ variants }: { variants: Variant[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Variant | null>(variants[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState<null | "add" | "buy">(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function pickVariant(v: Variant) {
    setSelected(v);
    setQuantity(1); // mỗi SKU tồn khác nhau → reset về 1 cho an toàn
    setMessage(null);
  }

  // Thêm số lượng đang chọn vào giỏ; trả true nếu thành công.
  async function addToCart(): Promise<boolean> {
    if (!selected) return false;
    try {
      await apiClient("/api/cart/items", {
        method: "POST",
        body: JSON.stringify({ variantId: selected.id, quantity }),
      });
      return true;
    } catch (e) {
      setMessage({ type: "err", text: (e as Error).message });
      return false;
    }
  }

  async function handleAdd() {
    setBusy("add");
    setMessage(null);
    const ok = await addToCart();
    if (ok) setMessage({ type: "ok", text: `Đã thêm ${quantity} sản phẩm vào giỏ` });
    setBusy(null);
  }

  async function handleBuyNow() {
    setBusy("buy");
    setMessage(null);
    const ok = await addToCart();
    setBusy(null);
    if (ok) router.push("/checkout"); // mua thẳng → tới checkout luôn
  }

  if (variants.length === 0)
    return (
      <p className="mt-6 flex items-center gap-2 text-destructive">
        <AlertCircle className="size-4" /> Sản phẩm chưa có phiên bản bán.
      </p>
    );

  const outOfStock = !selected || selected.stock <= 0;

  return (
    <div className="mt-6 border-t border-border pt-6">
      <p className="mb-2 text-sm font-medium">Chọn phiên bản</p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => pickVariant(v)}
            disabled={v.stock <= 0}
            className={cn(
              "rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              selected?.id === v.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-input hover:bg-accent"
            )}
          >
            {v.sku}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-5">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatVND(selected.price)}</span>
            {selected.compareAtPrice && selected.compareAtPrice > selected.price && (
              <span className="text-muted-foreground line-through">
                {formatVND(selected.compareAtPrice)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {selected.stock > 0 ? `Còn ${selected.stock} sản phẩm` : "Hết hàng"}
          </p>

          {/* Chọn số lượng — kẹp tối đa theo tồn kho của variant */}
          {!outOfStock && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium">Số lượng</span>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={selected.stock}
                disabled={busy !== null}
              />
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAdd}
              disabled={busy !== null || outOfStock}
              variant="outline"
              size="lg"
              className="sm:w-auto"
            >
              <ShoppingCart className="size-4" />
              {busy === "add" ? "Đang thêm..." : "Thêm vào giỏ"}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={busy !== null || outOfStock}
              size="lg"
              className="sm:w-auto"
            >
              <Zap className="size-4" />
              {busy === "buy" ? "Đang xử lý..." : "Mua ngay"}
            </Button>
          </div>

          {message && (
            <p
              className={cn(
                "mt-3 flex items-center gap-2 text-sm",
                message.type === "ok" ? "text-success" : "text-destructive"
              )}
            >
              {message.type === "ok" ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
