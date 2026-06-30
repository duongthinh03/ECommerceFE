"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Address, AddressInput } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddressForm } from "@/components/address-form";

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | "new" | null>(null); // id đang sửa, "new" = đang thêm
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiClient<Address[]>("/api/addresses");
    setAddresses(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login?redirect=/account/addresses");
      return;
    }
    load();
  }, [router, load]);

  async function create(data: AddressInput) {
    setSubmitting(true);
    try {
      await apiClient("/api/addresses", { method: "POST", body: JSON.stringify(data) });
      setEditing(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function update(id: number, data: AddressInput) {
    setSubmitting(true);
    try {
      await apiClient(`/api/addresses/${id}`, { method: "PUT", body: JSON.stringify(data) });
      setEditing(null);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function setDefault(id: number) {
    await apiClient(`/api/addresses/${id}/default`, { method: "PUT" });
    await load();
  }

  async function remove(id: number) {
    await apiClient(`/api/addresses/${id}`, { method: "DELETE" });
    await load();
  }

  if (loading)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải...
      </Container>
    );

  return (
    <Container className="max-w-3xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sổ địa chỉ</h1>
          <p className="text-muted-foreground">Quản lý địa chỉ giao hàng của bạn</p>
        </div>
        {editing === null && (
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Thêm địa chỉ
          </Button>
        )}
      </div>

      {/* Form thêm mới */}
      {editing === "new" && (
        <Card className="mb-6 p-5">
          <h2 className="mb-4 font-semibold">Thêm địa chỉ mới</h2>
          <AddressForm onSubmit={create} onCancel={() => setEditing(null)} submitting={submitting} />
        </Card>
      )}

      {addresses && addresses.length === 0 && editing === null ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <MapPin className="size-8" />
          <p>Chưa có địa chỉ nào. Thêm một địa chỉ để thanh toán nhanh hơn.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses?.map((a) =>
            editing === a.id ? (
              <Card key={a.id} className="p-5">
                <h2 className="mb-4 font-semibold">Sửa địa chỉ</h2>
                <AddressForm
                  initial={a}
                  onSubmit={(data) => update(a.id, data)}
                  onCancel={() => setEditing(null)}
                  submitting={submitting}
                  submitLabel="Cập nhật"
                />
              </Card>
            ) : (
              <Card key={a.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{a.fullName}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{a.phone}</span>
                    {a.isDefault && (
                      <Badge variant="success" className="gap-1">
                        <Star className="size-3" /> Mặc định
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.addressLine}, {a.ward}, {a.district}, {a.province}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!a.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => setDefault(a.id)}>
                      Đặt mặc định
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" aria-label="Sửa" onClick={() => setEditing(a.id)}>
                    <Pencil className="size-4" />
                  </Button>
                  <button
                    onClick={() => remove(a.id)}
                    aria-label="Xóa"
                    className="grid size-10 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            )
          )}
        </div>
      )}
    </Container>
  );
}
