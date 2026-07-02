"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Hiển thị (value cố định) hoặc chọn (truyền onChange).
export function StarRating({
  value,
  onChange,
  size = 16,
  className,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  className?: string;
}) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  const shown = hover || value;

  return (
    <div className={cn("flex items-center", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            "transition-colors",
            i <= shown ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/40",
            interactive && "cursor-pointer"
          )}
          onClick={interactive ? () => onChange!(i) : undefined}
          onMouseEnter={interactive ? () => setHover(i) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
        />
      ))}
    </div>
  );
}
