import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Boxes, Sparkles } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Product, Paged } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/utils";

// Lấy vài SP nổi bật cho trang chủ; lỗi API thì trang chủ vẫn hiển thị (không hard-fail).
async function getFeatured(): Promise<Product[]> {
  try {
    const res = await apiGet<Paged<Product>>("/api/products?pageSize=8");
    return res.data.items;
  } catch {
    return [];
  }
}

const valueProps = [
  { icon: Boxes, title: "Đa ngành hàng", desc: "Vợt, giày, sách… tất cả tại một nơi." },
  { icon: Truck, title: "Giao hàng nhanh", desc: "Ship toàn quốc, thanh toán khi nhận (COD)." },
  { icon: ShieldCheck, title: "Mua sắm an tâm", desc: "Thông tin đơn hàng minh bạch, rõ ràng." },
];

export default async function Home() {
  const featured = await getFeatured();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/60 via-background to-background">
        {/* Khối trang trí mờ tạo chiều sâu */}
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 size-72 rounded-full bg-indigo-300/30 blur-3xl" />

        <Container className="relative flex flex-col items-center gap-6 py-24 text-center sm:py-32">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-sm font-medium text-accent-foreground shadow-soft backdrop-blur">
            <Sparkles className="size-3.5" />
            Thương mại điện tử đa ngành
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Mua sắm trực tuyến,{" "}
            <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
              dễ như chạm
            </span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Khám phá hàng nghìn sản phẩm — chọn phiên bản, thêm vào giỏ và thanh toán
            COD chỉ trong vài bước.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products" className={cn(buttonVariants({ size: "lg" }))}>
              Mua sắm ngay
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/cart" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Xem giỏ hàng
            </Link>
          </div>
        </Container>
      </section>

      {/* Value props */}
      <section className="border-b border-border bg-muted/30">
        <Container className="grid gap-4 py-12 sm:grid-cols-3">
          {valueProps.map((v) => (
            <div
              key={v.title}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="rounded-lg bg-accent p-2.5 text-accent-foreground">
                <v.icon className="size-5" />
              </div>
              <div>
                <p className="font-semibold">{v.title}</p>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* Featured products */}
      <section>
        <Container className="py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Sản phẩm nổi bật</h2>
              <p className="mt-1 text-muted-foreground">Một vài lựa chọn dành cho bạn</p>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
            >
              Xem tất cả <ArrowRight className="size-4" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <p>Chưa có sản phẩm để hiển thị.</p>
              <Link
                href="/products"
                className={cn(buttonVariants({ variant: "outline" }), "mt-4")}
              >
                Tới trang sản phẩm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
