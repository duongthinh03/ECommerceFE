import Link from "next/link";
import { Store } from "lucide-react";
import { Container } from "@/components/ui/container";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <Container className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Store className="size-5 text-primary" />
          <span>ShopViet</span>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/products" className="hover:text-foreground">
            Sản phẩm
          </Link>
          <Link href="/cart" className="hover:text-foreground">
            Giỏ hàng
          </Link>
        </nav>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ShopViet. Demo thương mại điện tử.
        </p>
      </Container>
    </footer>
  );
}
