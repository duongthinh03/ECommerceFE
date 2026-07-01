import { getSessionId } from "./session";
import { clearToken } from "./auth";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5232";

// API mình trả dạng { success, message, data }
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// helper GET đơn giản (chạy phía SERVER — không dính token/refresh)
export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${path} lỗi: ${res.status}`);
  return res.json();
}

// Single-flight: nhiều request cùng dính 401 chỉ refresh MỘT lần (refresh token rotate,
// gọi 2 lần song song thì lần sau dùng token đã bị thu hồi → fail oan).
// Refresh token nằm trong cookie httpOnly → chỉ cần credentials:"include", BE tự đọc + set cookie mới.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: "{}",
        });
        return res.ok; // cookie access/refresh mới do BE tự set
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function logoutAndRedirect() {
  clearToken();
  if (typeof window !== "undefined") window.location.href = "/login";
}

// Gọi API phía CLIENT (browser) — cookie httpOnly tự gửi kèm (credentials:"include"), tự refresh khi 401.
export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // gửi/nhận cookie httpOnly (access + refresh token)
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": getSessionId(),
      ...(options.headers ?? {}),
    },
  });

  // Các endpoint đăng nhập: 401 = sai mật khẩu/2FA, KHÔNG phải phiên hết hạn → đừng refresh, để lỗi thật hiện ra
  const isCredentialEndpoint = ["/api/auth/login", "/api/auth/google", "/api/auth/register", "/api/auth/refresh"]
    .some((p) => path.startsWith(p));

  // Access token hết hạn → thử refresh (bằng cookie) đúng 1 lần rồi gọi lại request cũ
  if (res.status === 401 && !retried && !isCredentialEndpoint) {
    const ok = await refreshAccessToken();
    if (ok) return apiClient<T>(path, options, true); // retry với cookie mới
    // refresh cũng fail = phiên thực sự hết → đăng xuất
    logoutAndRedirect();
    throw new Error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? `API ${path} lỗi: ${res.status}`);
  }
  return res.json();
}
