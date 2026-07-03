"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, User, KeyRound, CheckCircle2, Camera, Trash2,
  Package, MapPin, Heart, ShieldCheck,
} from "lucide-react";
import { apiClient, API_URL } from "@/lib/api";
import { isLoggedIn, getUser, setUser, clearToken } from "@/lib/auth";
import { Profile } from "@/lib/types";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const hubLinks = [
  { href: "/account/orders", label: "Đơn hàng của tôi", icon: Package },
  { href: "/account/addresses", label: "Sổ địa chỉ", icon: MapPin },
  { href: "/account/wishlist", label: "Sản phẩm yêu thích", icon: Heart },
  { href: "/account/security", label: "Bảo mật (2FA)", icon: ShieldCheck },
];

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [infoErr, setInfoErr] = useState("");

  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwErr, setPwErr] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login?redirect=/account/profile"); return; }
    apiClient<Profile>("/api/auth/profile")
      .then((r) => {
        setProfile(r.data);
        setFullName(r.data.fullName);
        setPhone(r.data.phone ?? "");
        setDob(r.data.dateOfBirth ?? "");
        setGender(r.data.gender ?? "");
        setAvatarUrl(r.data.avatarUrl ?? null);
        const u = getUser();
        if (u) setUser({ ...u, avatarUrl: r.data.avatarUrl ?? null });   // đồng bộ header
      })
      .catch(() => setProfile(null));
  }, [router]);

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setInfoErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/api/auth/avatar`, { method: "POST", credentials: "include", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message ?? "Tải ảnh thất bại");
      setAvatarUrl(j.data.url);
      const u = getUser();
      if (u) setUser({ ...u, avatarUrl: j.data.url });
    } catch (err) {
      setInfoErr((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function removeAvatar() {
    if (!confirm("Xóa ảnh đại diện?")) return;
    try {
      await apiClient("/api/auth/avatar", { method: "DELETE" });
      setAvatarUrl(null);
      const u = getUser();
      if (u) setUser({ ...u, avatarUrl: null });
    } catch (e) {
      setInfoErr((e as Error).message);
    }
  }

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoErr(""); setInfoMsg(""); setSavingInfo(true);
    try {
      const r = await apiClient<Profile>("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ fullName, phone: phone || null, dateOfBirth: dob || null, gender: gender || null }),
      });
      setProfile(r.data);
      const u = getUser();
      if (u) setUser({ ...u, fullName: r.data.fullName });
      setInfoMsg("Đã lưu thông tin");
    } catch (e) {
      setInfoErr((e as Error).message);
    } finally {
      setSavingInfo(false);
    }
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    setPwErr("");
    if (newPw !== confirmPw) { setPwErr("Mật khẩu mới nhập lại không khớp"); return; }
    setSavingPw(true);
    try {
      await apiClient("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      clearToken();
      alert("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      router.push("/login");
    } catch (e) {
      setPwErr((e as Error).message);
      setSavingPw(false);
    }
  }

  if (!profile)
    return (
      <Container className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải...
      </Container>
    );

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Thông tin tài khoản</h1>

      {/* Truy cập nhanh */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {hubLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
          >
            <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <l.icon className="size-5" />
            </span>
            <span className="text-xs font-medium leading-snug">{l.label}</span>
          </Link>
        ))}
      </div>

      {/* Thông tin cá nhân */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><User className="size-5" /> Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Avatar */}
          <div className="mb-5 flex items-center gap-4">
            <div className="grid size-20 place-items-center overflow-hidden rounded-full bg-muted">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Ảnh đại diện" className="size-full object-cover" />
              ) : (
                <User className="size-8 text-muted-foreground/40" />
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                  {uploading ? "Đang tải..." : "Đổi ảnh đại diện"}
                </Button>
                {avatarUrl && (
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={removeAvatar}>
                    <Trash2 className="size-4" /> Xóa ảnh
                  </Button>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">JPG/PNG/WebP, tối đa 5MB.</p>
            </div>
          </div>

          <form onSubmit={saveInfo} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">
                {profile.provider === "Google" ? "Đăng nhập bằng Google" : profile.emailConfirmed ? "Email đã xác thực" : "Email chưa xác thực"}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input id="fullName" value={fullName} required onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" value={phone} placeholder="09xxxxxxxx" onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dob">Ngày sinh</Label>
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender">Giới tính</Label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className={selectCls}>
                <option value="">Không chọn</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
            {infoErr && <p className="text-sm text-destructive">{infoErr}</p>}
            {infoMsg && <p className="flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="size-4" /> {infoMsg}</p>}
            <Button type="submit" disabled={savingInfo}>
              {savingInfo ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Đổi mật khẩu */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><KeyRound className="size-5" /> Đổi mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.hasPassword ? (
            <form onSubmit={changePw} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="curPw">Mật khẩu hiện tại</Label>
                <Input id="curPw" type="password" value={curPw} required onChange={(e) => setCurPw(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="newPw">Mật khẩu mới</Label>
                  <Input id="newPw" type="password" value={newPw} required minLength={6} onChange={(e) => setNewPw(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPw">Nhập lại mật khẩu mới</Label>
                  <Input id="confirmPw" type="password" value={confirmPw} required minLength={6} onChange={(e) => setConfirmPw(e.target.value)} />
                </div>
              </div>
              {pwErr && <p className="text-sm text-destructive">{pwErr}</p>}
              <Button type="submit" disabled={savingPw}>
                {savingPw ? "Đang đổi..." : "Đổi mật khẩu"}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Tài khoản đăng nhập bằng Google không dùng mật khẩu.</p>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
