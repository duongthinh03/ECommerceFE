"use client";

import { useState } from "react";
import { AddressInput } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const fields = [
  { name: "fullName", label: "Người nhận", placeholder: "Nguyễn Văn A" },
  { name: "phone", label: "Số điện thoại", placeholder: "09xxxxxxxx" },
  { name: "province", label: "Tỉnh/Thành", placeholder: "Hà Nội" },
  { name: "district", label: "Quận/Huyện", placeholder: "Cầu Giấy" },
  { name: "ward", label: "Phường/Xã", placeholder: "Dịch Vọng" },
  { name: "addressLine", label: "Số nhà, đường", placeholder: "Số 1, đường ABC" },
] as const;

const empty: AddressInput = {
  fullName: "", phone: "", province: "", district: "", ward: "", addressLine: "", isDefault: false,
};

interface AddressFormProps {
  initial?: Partial<AddressInput>;
  onSubmit: (data: AddressInput) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  submitting?: boolean;
}

export function AddressForm({ initial, onSubmit, onCancel, submitLabel = "Lưu", submitting }: AddressFormProps) {
  const [form, setForm] = useState<AddressInput>({ ...empty, ...initial });

  function set<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <Label htmlFor={f.name}>{f.label}</Label>
            <Input
              id={f.name}
              placeholder={f.placeholder}
              required
              value={form[f.name]}
              onChange={(e) => set(f.name, e.target.value)}
            />
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="size-4 accent-primary"
        />
        Đặt làm địa chỉ mặc định
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Đang lưu..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Hủy
          </Button>
        )}
      </div>
    </form>
  );
}
