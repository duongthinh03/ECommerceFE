"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, Store, User, LogOut, MapPin, LayoutDashboard, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isLoggedIn, clearToken, isStaff } from "@/lib/auth";
import { apiClient } from "@/lib/api";

const navLinks = [{ href: "/products", label: "Sản phẩm" }];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  // mounted: tránh hydration mismatch vì trạng thái login đọc từ localStorage (chỉ có ở client)
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [staff, setStaff] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
    setStaff(isStaff());
    // cập nhật số lượng giỏ mỗi khi đổi route (vd vừa thêm hàng xong điều hướng)
    apiClient<{ totalQuantity: number }>("/api/cart")
      .then((r) => setCartCount(r.data.totalQuantity ?? 0))
      .catch(() => {});
  }, [pathname]); // đổi route thì kiểm tra lại (vd vừa login xong)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function logout() {
    // gọi BE để xóa cookie httpOnly (JS không tự xóa được), rồi xóa dấu vết client
    try {
      await apiClient("/api/auth/logout", { method: "POST" });
    } catch {
      /* lỗi mạng cũng vẫn dọn phía client */
    }
    clearToken();
    setLoggedIn(false);
    router.push("/");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md transition-shadow",
        scrolled ? "border-border shadow-soft" : "border-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Store className="size-4" />
          </span>
          <span>
            Shop<span className="text-primary">Viet</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith(l.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
          {mounted && staff && (
            <>
              <span className="ml-1 hidden items-center gap-1 text-muted-foreground/60 lg:flex">
                <LayoutDashboard className="size-4" />
              </span>
              {[
                { href: "/admin/orders", label: "Đơn" },
                { href: "/admin/products", label: "Sản phẩm" },
                { href: "/admin/coupons", label: "Coupon" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname.startsWith(l.href) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label="Giỏ hàng"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
          >
            <ShoppingCart className="size-5" />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-[18px] text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Chỉ render trạng thái auth sau khi mounted để khớp server/client */}
          {mounted && loggedIn ? (
            <>
              <Link
                href="/account/orders"
                aria-label="Đơn của tôi"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              >
                <Package className="size-5" />
              </Link>
              <Link
                href="/account/addresses"
                aria-label="Sổ địa chỉ"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              >
                <MapPin className="size-5" />
              </Link>
              <button
                onClick={logout}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link
              href={
                pathname.startsWith("/login")
                  ? "/login"
                  : `/login?redirect=${encodeURIComponent(pathname)}`
              }
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              <User className="size-4" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}
