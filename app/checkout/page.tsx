"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, MapPin, Plus, Star } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Address } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

interface OrderResult { orderCode: string; finalAmount: number; status: string; }

const manualFields = [
  { name: "shipRecipient", label: "Người nhận", placeholder: "Nguyễn Văn A" },
  { name: "shipPhone", label: "Số điện thoại", placeholder: "09xxxxxxxx" },
  { name: "shipProvince", label: "Tỉnh/Thành", placeholder: "Hà Nội" },
  { name: "shipDistrict", label: "Quận/Huyện", placeholder: "Cầu Giấy" },
  { name: "shipWard", label: "Phường/Xã", placeholder: "Dịch Vọng" },
  { name: "shipAddressLine", label: "Số nhà, đường", placeholder: "Số 1, đường ABC" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [useNew, setUseNew] = useState(false); // đang nhập địa chỉ mới (không chọn từ sổ)
  const [saveNew, setSaveNew] = useState(true);

  const [form, setForm] = useState({
    shipRecipient: "", shipPhone: "", shipProvince: "", shipDistrict: "",
    shipWard: "", shipAddressLine: "", note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);

  // chưa login thì về trang login (checkout cần token) — rồi quay lại đây
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login?redirect=/checkout");
      return;
    }
    // nạp sổ địa chỉ: có thì chọn cái mặc định, không có thì mở form nhập mới
    apiClient<Address[]>("/api/addresses")
      .then((res) => {
        const list = res.data;
        setAddresses(list);
        if (list.length > 0) {
          setSelectedId((list.find((a) => a.isDefault) ?? list[0]).id);
          setUseNew(false);
        } else {
          setUseNew(true);
        }
      })
      .catch(() => setUseNew(true));
  }, [router]);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Lấy thông tin giao hàng từ địa chỉ đã chọn HOẶC form nhập tay
      let ship;
      if (!useNew && selectedId != null) {
        const a = addresses.find((x) => x.id === selectedId)!;
        ship = {
          shipRecipient: a.fullName, shipPhone: a.phone, shipProvince: a.province,
          shipDistrict: a.district, shipWard: a.ward, shipAddressLine: a.addressLine,
        };
      } else {
        ship = {
          shipRecipient: form.shipRecipient, shipPhone: form.shipPhone, shipProvince: form.shipProvince,
          shipDistrict: form.shipDistrict, shipWard: form.shipWard, shipAddressLine: form.shipAddressLine,
        };
        // Lưu địa chỉ mới vào sổ (best-effort, lỗi cũng không chặn đặt đơn)
        if (saveNew) {
          try {
            await apiClient("/api/addresses", {
              method: "POST",
              body: JSON.stringify({
                fullName: ship.shipRecipient, phone: ship.shipPhone, province: ship.shipProvince,
                district: ship.shipDistrict, ward: ship.shipWard, addressLine: ship.shipAddressLine,
                isDefault: addresses.length === 0,
              }),
            });
          } catch { /* lưu sổ lỗi vẫn đặt đơn */ }
        }
      }

      const res = await apiClient<OrderResult>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ ...ship, note: form.note, paymentMethod: "COD" }),
      });
      setOrder(res.data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // màn xác nhận sau khi đặt
  if (order) {
    return (
      <Container className="py-16">
        <Card className="mx-auto max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-3 p-8">
            <CheckCircle2 className="size-14 text-success" />
            <h1 className="text-2xl font-bold">Đặt hàng thành công!</h1>
            <div className="text-muted-foreground">
              <p>Mã đơn: <b className="text-foreground">{order.orderCode}</b></p>
              <p>Tổng tiền: <b className="text-foreground">{formatVND(order.finalAmount)}</b></p>
              <p>Trạng thái: {order.status} · Thanh toán khi nhận (COD)</p>
            </div>
            <Link href="/products" className={cn(buttonVariants(), "mt-2")}>
              Tiếp tục mua sắm
            </Link>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Thanh toán</h1>
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>Thông tin giao hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={placeOrder} className="space-y-4">
            {/* Chọn từ sổ địa chỉ (nếu có) */}
            {addresses.length > 0 && (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => { setSelectedId(a.id); setUseNew(false); }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                      !useNew && selectedId === a.id
                        ? "border-primary bg-primary/5"
                        : "border-input hover:bg-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                        !useNew && selectedId === a.id ? "border-primary" : "border-muted-foreground/40"
                      )}
                    >
                      {!useNew && selectedId === a.id && <span className="size-2 rounded-full bg-primary" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <b>{a.fullName}</b>
                        <span className="text-muted-foreground">{a.phone}</span>
                        {a.isDefault && (
                          <Badge variant="success" className="gap-1">
                            <Star className="size-3" /> Mặc định
                          </Badge>
                        )}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {a.addressLine}, {a.ward}, {a.district}, {a.province}
                      </span>
                    </span>
                  </button>
                ))}

                {!useNew && (
                  <button
                    type="button"
                    onClick={() => setUseNew(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Plus className="size-4" /> Giao tới địa chỉ khác
                  </button>
                )}
              </div>
            )}

            {/* Form nhập địa chỉ mới */}
            {useNew && (
              <div className="space-y-4 rounded-lg border border-border p-4">
                {addresses.length > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1.5 font-medium">
                      <MapPin className="size-4" /> Địa chỉ mới
                    </p>
                    <button
                      type="button"
                      onClick={() => setUseNew(false)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Chọn từ sổ
                    </button>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {manualFields.map((f) => (
                    <div key={f.name} className="space-y-1.5">
                      <Label htmlFor={f.name}>{f.label}</Label>
                      <Input id={f.name} name={f.name} placeholder={f.placeholder} required onChange={update} />
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={saveNew}
                    onChange={(e) => setSaveNew(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  Lưu địa chỉ này vào sổ
                </label>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
              <Textarea id="note" name="note" placeholder="Giao giờ hành chính..." onChange={update} />
            </div>

            <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
              Phương thức thanh toán: <b>Thanh toán khi nhận hàng (COD)</b>
            </div>

            {error && (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="size-4" /> {error}
              </p>
            )}

            <Button type="submit" disabled={loading} size="lg" variant="success" className="w-full">
              {loading ? "Đang đặt hàng..." : "Đặt hàng"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
