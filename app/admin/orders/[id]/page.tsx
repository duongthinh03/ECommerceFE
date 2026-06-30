"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldAlert, ChevronLeft, Check } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn, isStaff } from "@/lib/auth";
import { Order } from "@/lib/types";
import { formatVND } from "@/lib/format";
import {
  ORDER_STATUSES, ORDER_STATUS_LABEL, orderStatusVariant,
  PAYMENT_STATUS_LABEL, paymentStatusVariant,
} from "@/lib/order-status";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [denied, setDenied] = useState(false);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const r = await apiClient<Order>(`/api/admin/orders/${id}`);
    setOrder(r.data);
    setStatus(r.data.status);
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push(`/login?redirect=/admin/orders/${id}`);
      return;
    }
    if (!isStaff()) {
      setDenied(true);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, id]);

  async function updateStatus() {
    setSaving(true);
    setMessage("");
    try {
      const r = await apiClient<Order>(`/api/admin/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, note: note || null }),
      });
      setOrder(r.data);
      setStatus(r.data.status);
      setNote("");
      setMessage("Đã cập nhật trạng thái");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (denied)
    return (
      <Container className="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
        <ShieldAlert className="size-10" />
        <p className="text-lg font-semibold text-foreground">Không có quyền truy cập</p>
      </Container>
    );

  if (!order)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải...
      </Container>
    );

  return (
    <Container className="max-w-3xl py-8">
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Tất cả đơn
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

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Sản phẩm */}
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

          {/* Giao hàng */}
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

        {/* Đổi trạng thái */}
        <Card className="h-fit">
          <CardHeader><CardTitle>Cập nhật trạng thái</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="status">Trạng thái</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Lý do / ghi chú" />
            </div>
            <Button onClick={updateStatus} disabled={saving} className="w-full">
              {saving ? "Đang lưu..." : "Cập nhật"}
            </Button>
            {message && (
              <p className="flex items-center gap-1.5 text-sm text-success">
                <Check className="size-4" /> {message}
              </p>
            )}
          </CardContent>
        </Card>
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
