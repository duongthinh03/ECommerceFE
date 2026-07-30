import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// Dãy số trang hiển thị: luôn có trang 1 & cuối, quanh trang hiện tại ±1, chèn "…" khi cách xa.
function pageWindow(current: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  out.push(1);
  if (left > 2) out.push("…");
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 1) out.push("…");
  if (total > 1) out.push(total);
  return out;
}

const arrow = (enabled: boolean) =>
  cn(buttonVariants({ variant: "outline", size: "sm" }), !enabled && "pointer-events-none opacity-40");

// Server component: render <Link> giữ nguyên filter (hrefFor). SEO tốt, không cần JS.
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (p: number) => string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Phân trang">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={arrow(true)} aria-label="Trang trước">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={arrow(false)}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1.5 text-muted-foreground select-none">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: p === page ? "default" : "outline", size: "sm" }),
              "min-w-9",
              p === page && "pointer-events-none"
            )}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={arrow(true)} aria-label="Trang sau">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={arrow(false)}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
