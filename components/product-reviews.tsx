"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2, User as UserIcon } from "lucide-react";
import { apiClient } from "@/lib/api";
import { getUser, isLoggedIn } from "@/lib/auth";
import { ReviewSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { StarRating } from "@/components/star-rating";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ProductReviews({ productId }: { productId: number | string }) {
  const [data, setData] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
  const me = getUser();

  const load = useCallback(async () => {
    try {
      const r = await apiClient<ReviewSummary>(`/api/products/${productId}/reviews`);
      setData(r.data);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      await apiClient(`/api/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comment: comment.trim() || null }),
      });
      setComment("");
      setRating(5);
      await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(reviewId: number) {
    if (!confirm("Xóa đánh giá này?")) return;
    try {
      await apiClient(`/api/products/${productId}/reviews/${reviewId}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (loading)
    return (
      <div className="flex items-center gap-2 py-6 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Đang tải đánh giá...
      </div>
    );

  if (!data) return null;

  return (
    <section className="mt-12 border-t border-border pt-8">
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight">Đánh giá</h2>
        {data.count > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <StarRating value={Math.round(data.averageRating)} />
            <span className="font-semibold">{data.averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({data.count})</span>
          </div>
        )}
      </div>

      {/* Form viết đánh giá / trạng thái */}
      {data.canReview ? (
        <form onSubmit={submit} className="mb-8 space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="font-medium">Viết đánh giá của bạn</p>
          <StarRating value={rating} onChange={setRating} size={24} />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cảm nhận của bạn về sản phẩm (không bắt buộc)"
            maxLength={1000}
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" disabled={submitting} className="gap-1.5">
            {submitting && <Loader2 className="size-4 animate-spin" />} Gửi đánh giá
          </Button>
        </form>
      ) : data.hasReviewed ? (
        <p className="mb-8 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
          Bạn đã đánh giá sản phẩm này. Cảm ơn bạn!
        </p>
      ) : isLoggedIn() ? (
        <p className="mb-8 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
          Chỉ khách đã mua sản phẩm mới có thể đánh giá.
        </p>
      ) : (
        <p className="mb-8 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">Đăng nhập</Link>{" "}
          để đánh giá sản phẩm đã mua.
        </p>
      )}

      {/* Danh sách đánh giá */}
      {data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-muted-foreground">
          Chưa có đánh giá nào.
        </div>
      ) : (
        <ul className="space-y-4">
          {data.items.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-muted-foreground">
                    {r.userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.userAvatarUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <UserIcon className="size-5" />
                    )}
                  </span>
                  <div>
                    <p className="font-medium">{r.userName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating value={r.rating} size={14} />
                      <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
                {me?.id === r.userId && (
                  <button onClick={() => remove(r.id)} className="p-1 text-muted-foreground hover:text-destructive" aria-label="Xóa">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              {r.comment && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
