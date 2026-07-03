"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Boxes, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

const tabs = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Đơn hàng", icon: Package },
  { href: "/admin/products", label: "Sản phẩm", icon: Boxes },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: Ticket },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      {/* Thanh điều hướng riêng của khu quản trị */}
      <div className="border-b border-border bg-muted/30">
        <Container className="flex gap-1 overflow-x-auto py-2">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <t.icon className="size-4" /> {t.label}
              </Link>
            );
          })}
        </Container>
      </div>
      {children}
    </div>
  );
}
