"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { setUser, type AuthUser } from "@/lib/auth";
import { getSessionId } from "@/lib/session";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đích sau login = ?redirect, mặc định home. Chỉ nhận path nội bộ (chặn open-redirect ra site ngoài).
  const redirectParam = searchParams.get("redirect");
  const target =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); // chặn form reload trang
    setError("");
    setLoading(true);
    try {
      // 1) đăng nhập → BE set cookie httpOnly; body trả user để lưu hiển thị UI
      const res = await apiClient<{ user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(res.data.user);

      // 2) merge giỏ guest → giỏ user
      try {
        await apiClient("/api/cart/merge", {
          method: "POST",
          body: JSON.stringify({ sessionId: getSessionId() }),
        });
      } catch {
        /* giỏ guest rỗng cũng kệ */
      }

      // 3) về đúng nơi xuất phát (hoặc home)
      router.push(target);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        <CardDescription>Đăng nhập để thanh toán và theo dõi đơn hàng.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ban@email.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" /> {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Container className="flex justify-center py-16">
      {/* useSearchParams cần bọc Suspense (yêu cầu Next 16) */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
