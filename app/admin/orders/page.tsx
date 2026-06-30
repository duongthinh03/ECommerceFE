"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldAlert, ChevronRight } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn, isStaff } from "@/lib/auth";
import { Order } from "@/lib/types";
import { formatVND } from "@/lib/format";
import {
  ORDER_STATUS_LABEL, orderStatusVariant,
  PAYMENT_STATUS_LABEL, paymentStatusVariant,
} from "@/lib/order-status";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login?redirect=/admin/orders");
      return;
    }
    if (!isStaff()) {
      setDenied(true);
      return;
    }
    apiClient<Order[]>("/api/admin/orders").then((r) => setOrders(r.data));
  }, [router]);

  if (denied)
    return (
      <Container className="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
        <ShieldAlert className="size-10" />
        <p className="text-lg font-semibold text-foreground">Không có quyền truy cập</p>
        <p>Khu vực quản trị chỉ dành cho nhân viên.</p>
      </Container>
    );

  if (!orders)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải đơn hàng...
      </Container>
    );

  return (
    <Container className="py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground">{orders.length} đơn</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Chưa có đơn hàng nào.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="block">
              <Card className="flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-lift">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{o.orderCode}</span>
                    <Badge variant={orderStatusVariant(o.status)}>
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </Badge>
                    <Badge variant={paymentStatusVariant(o.paymentStatus)}>
                      {PAYMENT_STATUS_LABEL[o.paymentStatus] ?? o.paymentStatus}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {o.shipRecipient} · {o.shipPhone} ·{" "}
                    {new Date(o.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold text-primary">{formatVND(o.finalAmount)}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
