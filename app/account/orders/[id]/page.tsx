"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ChevronLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Order } from "@/lib/types";
import { formatVND } from "@/lib/format";
import {
  ORDER_STATUS_LABEL, orderStatusVariant,
  PAYMENT_STATUS_LABEL, paymentStatusVariant,
} from "@/lib/order-status";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MyOrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push(`/login?redirect=/account/orders/${id}`);
      return;
    }
    apiClient<Order>(`/api/orders/${id}`).then((r) => setOrder(r.data)).catch(() => setOrder(null));
  }, [router, id]);

  // Đơn chuyển khoản chưa thanh toán → poll tới khi webhook SePay xác nhận
  const unpaidWithQr = !!order?.paymentQrUrl && order.paymentStatus !== "Paid";
  useEffect(() => {
    if (!unpaidWithQr) return;
    const timer = setInterval(async () => {
      try {
        const r = await apiClient<Order>(`/api/orders/${id}`);
        if (r.data.paymentStatus === "Paid") {
          setOrder(r.data);
          clearInterval(timer);
        }
      } catch { /* thử lại lần sau */ }
    }, 4000);
    return () => clearInterval(timer);
  }, [unpaidWithQr, id]);

  if (!order)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải...
      </Container>
    );

  return (
    <Container className="max-w-3xl py-8">
      <Link
        href="/account/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Đơn hàng của tôi
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{order.orderCode}</h1>
        <Badge variant={orderStatusVariant(order.status)}>
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </Badge>
        <Badge variant={paymentStatusVariant(order.paymentStatus)}>
          {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleString("vi-VN")}
        </span>
      </div>

      {/* Chưa thanh toán chuyển khoản → hiện lại QR */}
      {unpaidWithQr && (
        <Card className="mb-6 border-primary/40">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="font-semibold">Quét mã để thanh toán</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.paymentQrUrl!} alt="Mã VietQR" className="size-56 rounded-lg border" />
            <p className="text-lg font-bold text-primary">{formatVND(order.finalAmount)}</p>
            <p className="text-sm text-muted-foreground">
              Chuyển khoản giữ nguyên nội dung <b className="text-foreground">{order.orderCode}</b>.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="size-4 animate-spin" /> Đang chờ thanh toán...
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader><CardTitle>Sản phẩm</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((i, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{i.productName}</p>
                    <p className="text-muted-foreground">{i.sku} · SL {i.quantity} · {formatVND(i.price)}</p>
                  </div>
                  <span className="font-semibold">{formatVND(i.finalPrice)}</span>
                </div>
              ))}
              <div className="space-y-1 border-t border-border pt-3 text-sm">
                <Row label="Tạm tính" value={formatVND(order.totalAmount)} />
                <Row label="Phí ship" value={formatVND(order.shippingFee)} />
                {order.discountAmount > 0 && (
                  <Row label="Giảm giá" value={`- ${formatVND(order.discountAmount)}`} />
                )}
                <div className="flex justify-between pt-1 text-base font-bold">
                  <span>Tổng</span>
                  <span className="text-primary">{formatVND(order.finalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Giao hàng</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p><b>{order.shipRecipient}</b> · {order.shipPhone}</p>
              <p className="text-muted-foreground">{order.shipAddress}</p>
              <p className="text-muted-foreground">Thanh toán: {order.paymentMethod}</p>
              {order.note && <p className="text-muted-foreground">Ghi chú: {order.note}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
