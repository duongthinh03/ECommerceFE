"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, ShieldAlert, Wallet, CalendarDays, Clock, ShoppingBag,
  Users, Trophy, AlertTriangle,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn, isStaff } from "@/lib/auth";
import { Dashboard } from "@/lib/types";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABEL, orderStatusVariant } from "@/lib/order-status";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function Stat({ icon: Icon, label, value, accent }: { icon: typeof Wallet; label: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={accent ? "rounded-lg bg-primary/10 p-2.5 text-primary" : "rounded-lg bg-muted p-2.5 text-muted-foreground"}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [denied, setDenied] = useState(false);
  const [range, setRange] = useState<"7d" | "30d" | "12m">("7d");

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login?redirect=/admin"); return; }
    if (!isStaff()) { setDenied(true); return; }
    apiClient<Dashboard>("/api/admin/dashboard").then((r) => setData(r.data)).catch(() => setData(null));
  }, [router]);

  if (denied)
    return (
      <Container className="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
        <ShieldAlert className="size-10" />
        <p className="text-lg font-semibold text-foreground">Không có quyền truy cập</p>
      </Container>
    );

  if (!data)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải thống kê...
      </Container>
    );

  // Chuỗi doanh thu theo khoảng đang chọn (7 ngày = 7 phần tử cuối của daily)
  const series =
    range === "12m"
      ? data.revenueMonthly.map((m) => ({ key: m.month, value: m.revenue, label: `${m.month.slice(5, 7)}/${m.month.slice(0, 4)}` }))
      : (range === "30d" ? data.revenueDaily : data.revenueDaily.slice(-7)).map((d) => ({
          key: d.date, value: d.revenue, label: `${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`,
        }));
  const maxRev = Math.max(...series.map((s) => s.value), 1);
  const showLabel = (i: number) => series.length <= 12 || i % 5 === 0 || i === series.length - 1;
  const ranges = [
    { k: "7d", label: "7 ngày" },
    { k: "30d", label: "30 ngày" },
    { k: "12m", label: "12 tháng" },
  ] as const;

  return (
    <Container className="py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Tổng quan</h1>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat icon={Wallet} label="Doanh thu hôm nay" value={formatVND(data.revenueToday)} accent />
        <Stat icon={CalendarDays} label="Doanh thu tháng này" value={formatVND(data.revenueThisMonth)} accent />
        <Stat icon={Wallet} label="Tổng doanh thu" value={formatVND(data.revenueAllTime)} />
        <Stat icon={Clock} label="Đơn chờ xử lý" value={String(data.pendingOrders)} />
        <Stat icon={ShoppingBag} label="Tổng đơn hàng" value={String(data.totalOrders)} />
        <Stat icon={Users} label="Khách hàng" value={String(data.totalCustomers)} />
      </div>

      {/* Biểu đồ doanh thu — chọn khoảng 7 ngày / 30 ngày / 12 tháng */}
      <Card className="mt-6">
        <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Doanh thu</CardTitle>
          <div className="flex gap-1 rounded-lg bg-muted p-0.5">
            {ranges.map((r) => (
              <button
                key={r.k}
                onClick={() => setRange(r.k)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  range === r.k ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn("flex h-44", series.length > 12 ? "gap-1" : "gap-2")}>
            {series.map((s, i) => (
              <div key={s.key} className="flex h-full flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end" title={`${s.label}: ${formatVND(s.value)}`}>
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                    style={{ height: `${Math.max((s.value / maxRev) * 100, s.value > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <span className="h-3 text-[10px] leading-3 text-muted-foreground">
                  {showLabel(i) ? s.label : ""}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Đơn theo trạng thái */}
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Đơn theo trạng thái</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {data.ordersByStatus.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có đơn.</p>
          ) : (
            data.ordersByStatus.map((s) => (
              <Badge key={s.status} variant={orderStatusVariant(s.status)} className="gap-1">
                {ORDER_STATUS_LABEL[s.status] ?? s.status}
                <span className="font-bold">· {s.count}</span>
              </Badge>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Top bán chạy */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Trophy className="size-4 text-amber-500" /> Bán chạy nhất</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu bán hàng.</p>
            ) : (
              data.topProducts.map((p, i) => (
                <Link key={p.productId} href={`/admin/products/${p.productId}`} className="flex items-center justify-between gap-2 rounded-md p-2 text-sm hover:bg-accent">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
                    <span className="truncate font-medium">{p.name}</span>
                  </span>
                  <span className="shrink-0 text-muted-foreground">Đã bán {p.soldQty}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Sắp hết hàng */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="size-4 text-destructive" /> Sắp hết hàng</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có sản phẩm nào sắp hết.</p>
            ) : (
              data.lowStock.map((v) => (
                <Link key={`${v.productId}-${v.sku}`} href={`/admin/products/${v.productId}`} className="flex items-center justify-between gap-2 rounded-md p-2 text-sm hover:bg-accent">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{v.productName}</span>
                    <span className="text-xs text-muted-foreground">{v.optionName || v.sku}</span>
                  </span>
                  <Badge variant={v.stock === 0 ? "destructive" : "secondary"} className="shrink-0">
                    Tồn {v.stock}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
