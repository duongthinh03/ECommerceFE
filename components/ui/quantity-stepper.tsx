"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "default";
}

// Bộ chọn số lượng [−] n [+], kẹp trong [min, max]. Dùng ở trang chi tiết & giỏ hàng.
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  size = "default",
}: QuantityStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(max != null ? Math.min(max, value + 1) : value + 1);

  const btn = size === "sm" ? "size-8" : "size-10";
  const cell = size === "sm" ? "w-8 text-sm" : "w-12";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-input",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Giảm"
        className={cn(
          "grid place-items-center rounded-l-lg text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent",
          btn
        )}
      >
        <Minus className="size-4" />
      </button>
      <span className={cn("grid place-items-center font-medium tabular-nums", cell)}>{value}</span>
      <button
        type="button"
        onClick={inc}
        disabled={disabled || (max != null && value >= max)}
        aria-label="Tăng"
        className={cn(
          "grid place-items-center rounded-r-lg text-muted-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-transparent",
          btn
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
