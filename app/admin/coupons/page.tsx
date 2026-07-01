"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Trash2, Plus, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn, isStaff } from "@/lib/auth";
import { Coupon } from "@/lib/types";
import { formatVND } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const empty = {
  code: "", discountType: "Percent", discountValue: 0,
  minOrderAmount: 0, maxDiscountAmount: "", usageLimit: "", userUsageLimit: "", expiredAt: "",
};

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [f, setF] = useState({ ...empty });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await apiClient<Coupon[]>("/api/coupons");
    setCoupons(r.data);
  }

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login?redirect=/admin/coupons"); return; }
    if (!isStaff()) { setDenied(true); return; }
    load().catch((e) => setError((e as Error).message));
  }, [router]);

  const num = (s: string) => (s === "" ? null : Number(s));

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiClient("/api/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: f.code.trim().toUpperCase(),
          discountType: f.discountType,
          discountValue: Number(f.discountValue),
          minOrderAmount: Number(f.minOrderAmount),
          maxDiscountAmount: num(f.maxDiscountAmount),
          usageLimit: num(f.usageLimit),
          userUsageLimit: num(f.userUsageLimit),
          startsAt: null,
          expiredAt: f.expiredAt || null,
          isActive: true,
        }),
      });
      setF({ ...empty });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number, code: string) {
    if (!confirm(`Xóa mã "${code}"?`)) return;
    try {
      await apiClient(`/api/coupons/${id}`, { method: "DELETE" });
      setCoupons((c) => c?.filter((x) => x.id !== id) ?? null);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (denied)
    return (
      <Container className="flex flex-col items-center gap-3 py-24 text-center text-muted-foreground">
        <ShieldAlert className="size-10" />
        <p className="text-lg font-semibold text-foreground">Không có quyền truy cập</p>
      </Container>
    );

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Mã giảm giá</h1>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Form tạo */}
        <Card className="h-fit md:col-span-2">
          <CardHeader><CardTitle>Tạo mã mới</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="code">Mã</Label>
                <Input id="code" value={f.code} required onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="SALE10" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="type">Loại</Label>
                  <select
                    id="type"
                    value={f.discountType}
                    onChange={(e) => setF({ ...f, discountType: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Percent">Phần trăm (%)</option>
                    <option value="Fixed">Số tiền (đ)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="val">Giá trị</Label>
                  <Input id="val" type="number" min={0} value={f.discountValue} required onChange={(e) => setF({ ...f, discountValue: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="min">Đơn tối thiểu (đ)</Label>
                <Input id="min" type="number" min={0} value={f.minOrderAmount} onChange={(e) => setF({ ...f, minOrderAmount: Number(e.target.value) })} />
              </div>
              {f.discountType === "Percent" && (
                <div className="space-y-1.5">
                  <Label htmlFor="max">Giảm tối đa (đ, để trống = không giới hạn)</Label>
                  <Input id="max" type="number" min={0} value={f.maxDiscountAmount} onChange={(e) => setF({ ...f, maxDiscountAmount: e.target.value })} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="limit">Tổng lượt (trống=∞)</Label>
                  <Input id="limit" type="number" min={0} value={f.usageLimit} onChange={(e) => setF({ ...f, usageLimit: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ulimit">Lượt/người</Label>
                  <Input id="ulimit" type="number" min={0} value={f.userUsageLimit} onChange={(e) => setF({ ...f, userUsageLimit: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exp">Hết hạn (trống = không hết hạn)</Label>
                <Input id="exp" type="datetime-local" value={f.expiredAt} onChange={(e) => setF({ ...f, expiredAt: e.target.value })} />
              </div>
              {error && (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4" /> {error}
                </p>
              )}
              <Button type="submit" disabled={saving} className="w-full gap-1.5">
                <Plus className="size-4" /> {saving ? "Đang tạo..." : "Tạo mã"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danh sách */}
        <div className="md:col-span-3">
          {!coupons ? (
            <div className="flex items-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" /> Đang tải...
            </div>
          ) : coupons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              Chưa có mã giảm giá.
            </div>
          ) : (
            <div className="space-y-2">
              {coupons.map((c) => (
                <Card key={c.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-semibold">{c.code}</span>
                      <Badge variant={c.isActive ? "success" : "secondary"}>{c.isActive ? "Bật" : "Tắt"}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Giảm {c.discountType === "Percent" ? `${c.discountValue}%` : formatVND(c.discountValue)}
                      {c.maxDiscountAmount ? ` (tối đa ${formatVND(c.maxDiscountAmount)})` : ""}
                      {c.minOrderAmount > 0 ? ` · đơn từ ${formatVND(c.minOrderAmount)}` : ""}
                      {c.usageLimit ? ` · đã dùng ${c.usedCount}/${c.usageLimit}` : ` · đã dùng ${c.usedCount}`}
                    </p>
                  </div>
                  <button onClick={() => remove(c.id, c.code)} className="shrink-0 text-destructive hover:opacity-70" aria-label="Xóa">
                    <Trash2 className="size-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
