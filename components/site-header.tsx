"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, Store, User, LogOut, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isLoggedIn, clearToken } from "@/lib/auth";

const navLinks = [{ href: "/products", label: "Sản phẩm" }];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  // mounted: tránh hydration mismatch vì trạng thái login đọc từ localStorage (chỉ có ở client)
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoggedIn(isLoggedIn());
  }, [pathname]); // đổi route thì kiểm tra lại (vd vừa login xong)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function logout() {
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
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label="Giỏ hàng"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ShoppingCart className="size-5" />
          </Link>

          {/* Chỉ render trạng thái auth sau khi mounted để khớp server/client */}
          {mounted && loggedIn ? (
            <>
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
