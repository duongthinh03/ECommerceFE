// Token (access + refresh) nằm trong cookie httpOnly do BE set — JS KHÔNG đọc được (chống XSS).
// Client chỉ giữ thông tin user (không nhạy cảm) trong localStorage để hiển thị UI + gate menu.
// BE mới là chốt chặn thật (kiểm role từ JWT trong cookie).

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

const USER_KEY = "auth_user";

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Xóa dấu vết đăng nhập phía client (cookie httpOnly do BE /logout xóa).
export function clearToken() {
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getUser();
}

export function getUserRole(): string | null {
  return getUser()?.role ?? null;
}

// Có quyền vào khu admin? (BE cho Admin/Manager/Staff)
export function isStaff(): boolean {
  const r = getUserRole();
  return r === "Admin" || r === "Manager" || r === "Staff";
}
