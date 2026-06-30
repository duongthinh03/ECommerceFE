"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Package } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Order } from "@/lib/types";
import { formatVND } from "@/lib/format";
import {
  ORDER_STATUS_LABEL, orderStatusVariant,
  PAYMENT_STATUS_LABEL, paymentStatusVariant,
} from "@/lib/order-status";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login?redirect=/account/orders");
      return;
    }
    apiClient<Order[]>("/api/orders").then((r) => setOrders(r.data));
  }, [router]);

  if (!orders)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải đơn hàng...
      </Container>
    );

  return (
    <Container className="max-w-3xl py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <Package className="size-8" />
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link href="/products" className={cn(buttonVariants(), "mt-2")}>
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{o.orderCode}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={orderStatusVariant(o.status)}>
                    {ORDER_STATUS_LABEL[o.status] ?? o.status}
                  </Badge>
                  <Badge variant={paymentStatusVariant(o.paymentStatus)}>
                    {PAYMENT_STATUS_LABEL[o.paymentStatus] ?? o.paymentStatus}
                  </Badge>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(o.createdAt).toLocaleString("vi-VN")} · {o.items.length} sản phẩm
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="truncate text-sm text-muted-foreground">
                  {o.items.map((i) => i.productName).join(", ")}
                </span>
                <span className="shrink-0 font-semibold text-primary">{formatVND(o.finalAmount)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
