import { getSessionId } from "./session";
import { getToken, getRefreshToken, setTokens, clearToken } from "./auth";

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

// Single-flight: nhiều request cùng dính 401 chỉ refresh MỘT lần (vì refresh token rotate,
// gọi 2 lần song song thì lần sau dùng token đã bị thu hồi → fail oan).
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return null;
        const json = (await res.json()) as ApiResponse<{ accessToken: string; refreshToken: string }>;
        setTokens(json.data.accessToken, json.data.refreshToken); // lưu cặp token mới (đã rotate)
        return json.data.accessToken;
      } catch {
        return null;
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

// Gọi API phía CLIENT (browser) — tự gửi X-Session-Id + Bearer token, tự refresh khi 401.
export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
  retried = false
): Promise<ApiResponse<T>> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": getSessionId(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  // Access token hết hạn → thử refresh đúng 1 lần rồi gọi lại request cũ
  if (res.status === 401 && !retried && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiClient<T>(path, options, true); // retry với token mới
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
