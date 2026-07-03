"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowLeft, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setNote(""); setBusy(true);
    try {
      await apiClient("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
      setStep("reset");
      setNote("Nếu email tồn tại, mã đặt lại đã được gửi. Kiểm tra hộp thư (cả spam).");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (newPw !== confirmPw) { setErr("Mật khẩu nhập lại không khớp"); return; }
    setBusy(true);
    try {
      await apiClient("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword: newPw }),
      });
      alert("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
      router.push("/login");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Container className="flex justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="size-5" /> Quên mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={sendCode} className="space-y-4">
              <p className="text-sm text-muted-foreground">Nhập email tài khoản, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.</p>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} required onChange={(e) => setEmail(e.target.value)} placeholder="ban@email.com" />
              </div>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <Button type="submit" disabled={busy} className="w-full gap-1.5">
                {busy && <Loader2 className="size-4 animate-spin" />} Gửi mã
              </Button>
            </form>
          ) : (
            <form onSubmit={reset} className="space-y-4">
              {note && <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{note}</p>}
              <div className="space-y-1.5">
                <Label htmlFor="otp">Mã OTP (6 số)</Label>
                <Input id="otp" value={otp} required inputMode="numeric" onChange={(e) => setOtp(e.target.value)} placeholder="Mã trong email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPw">Mật khẩu mới</Label>
                <Input id="newPw" type="password" value={newPw} required minLength={6} onChange={(e) => setNewPw(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPw">Nhập lại mật khẩu mới</Label>
                <Input id="confirmPw" type="password" value={confirmPw} required minLength={6} onChange={(e) => setConfirmPw(e.target.value)} />
              </div>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <Button type="submit" disabled={busy} className="w-full gap-1.5">
                {busy && <Loader2 className="size-4 animate-spin" />} Đặt lại mật khẩu
              </Button>
              <button type="button" onClick={() => setStep("email")} className="text-sm text-muted-foreground hover:text-foreground">
                Gửi lại mã / đổi email
              </button>
            </form>
          )}

          <Link href="/login" className="mt-5 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Quay lại đăng nhập
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
