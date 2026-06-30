"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, MailCheck } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function VerifyForm() {
  const router = useRouter();
  const email = useSearchParams().get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [resent, setResent] = useState("");

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiClient("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResent("");
    setError("");
    try {
      await apiClient("/api/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) });
      setResent("Đã gửi lại mã OTP.");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (done)
    return (
      <Card className="w-full max-w-sm text-center">
        <CardContent className="flex flex-col items-center gap-3 p-8">
          <CheckCircle2 className="size-12 text-success" />
          <p className="text-lg font-semibold">Xác thực email thành công!</p>
          <p className="text-sm text-muted-foreground">Đang chuyển tới trang đăng nhập...</p>
        </CardContent>
      </Card>
    );

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MailCheck className="size-6 text-primary" /> Xác thực email
        </CardTitle>
        <CardDescription>
          Nhập mã OTP đã gửi tới <b className="text-foreground">{email || "email của bạn"}</b>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={verify} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="otp">Mã OTP</Label>
            <Input
              id="otp"
              inputMode="numeric"
              placeholder="Nhập mã 6 số"
              value={otp}
              required
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-lg tracking-widest"
            />
          </div>
          {error && (
            <p className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="size-4" /> {error}
            </p>
          )}
          {resent && <p className="text-sm text-success">{resent}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Đang xác thực..." : "Xác thực"}
          </Button>
        </form>

        <div className="mt-4 text-sm">
          <button onClick={resend} className="font-medium text-primary hover:underline">
            Gửi lại mã
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Container className="flex justify-center py-16">
      <Suspense fallback={null}>
        <VerifyForm />
      </Suspense>
    </Container>
  );
}
