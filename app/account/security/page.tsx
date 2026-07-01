"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, ShieldCheck, ShieldOff, Check, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SecurityPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function loadStatus() {
    const r = await apiClient<{ enabled: boolean }>("/api/auth/2fa/status");
    setEnabled(r.data.enabled);
  }

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login?redirect=/account/security"); return; }
    loadStatus().catch(() => setEnabled(false));
  }, [router]);

  async function run(fn: () => Promise<void>) {
    setBusy(true); setMsg(null);
    try { await fn(); } catch (e) { setMsg({ type: "err", text: (e as Error).message }); }
    finally { setBusy(false); }
  }

  const startSetup = () => run(async () => {
    const r = await apiClient<{ secret: string; otpauthUri: string }>("/api/auth/2fa/setup", { method: "POST" });
    setSetup(r.data); setCode("");
  });

  const enable = () => run(async () => {
    await apiClient("/api/auth/2fa/enable", { method: "POST", body: JSON.stringify({ code }) });
    setSetup(null); setCode(""); setMsg({ type: "ok", text: "Đã bật xác thực 2 lớp" });
    await loadStatus();
  });

  const disable = () => run(async () => {
    await apiClient("/api/auth/2fa/disable", { method: "POST", body: JSON.stringify({ code }) });
    setCode(""); setMsg({ type: "ok", text: "Đã tắt xác thực 2 lớp" });
    await loadStatus();
  });

  if (enabled === null)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải...
      </Container>
    );

  return (
    <Container className="max-w-lg py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Bảo mật</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {enabled ? <ShieldCheck className="size-5 text-success" /> : <ShieldOff className="size-5 text-muted-foreground" />}
            Xác thực 2 lớp (2FA)
          </CardTitle>
          <CardDescription>
            {enabled
              ? "Đang BẬT — mỗi lần đăng nhập cần thêm mã 6 số từ app Authenticator."
              : "Thêm lớp bảo vệ: cần mã 6 số từ app (Google/Microsoft Authenticator) khi đăng nhập."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!enabled && !setup && (
            <Button onClick={startSetup} disabled={busy}>{busy ? "..." : "Bật 2FA"}</Button>
          )}

          {!enabled && setup && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-border p-4">
                <QRCodeSVG value={setup.otpauthUri} size={180} />
                <p className="text-center text-sm text-muted-foreground">
                  Quét bằng app Authenticator, hoặc nhập tay khóa:
                </p>
                <code className="break-all rounded bg-muted px-2 py-1 text-xs">{setup.secret}</code>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="code">Nhập mã 6 số để xác nhận</Label>
                <Input id="code" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" className="text-center tracking-widest" />
              </div>
              <div className="flex gap-2">
                <Button onClick={enable} disabled={busy || code.length < 6}>{busy ? "..." : "Xác nhận bật"}</Button>
                <Button variant="outline" onClick={() => setSetup(null)} disabled={busy}>Hủy</Button>
              </div>
            </div>
          )}

          {enabled && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="dcode">Nhập mã 6 số để tắt</Label>
                <Input id="dcode" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" className="text-center tracking-widest" />
              </div>
              <Button variant="outline" onClick={disable} disabled={busy || code.length < 6} className="text-destructive hover:text-destructive">
                {busy ? "..." : "Tắt 2FA"}
              </Button>
            </div>
          )}

          {msg && (
            <p className={`flex items-center gap-2 text-sm ${msg.type === "ok" ? "text-success" : "text-destructive"}`}>
              {msg.type === "ok" ? <Check className="size-4" /> : <AlertCircle className="size-4" />} {msg.text}
            </p>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
