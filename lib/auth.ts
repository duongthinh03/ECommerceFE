const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

// Lưu cả 2 token sau login/refresh (refresh token để tự gia hạn khi access token hết hạn)
export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// .NET nhét role vào claim URI này (ClaimTypes.Role)
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

// Giải payload JWT phía client (chỉ để hiện UI — KHÔNG phải xác thực; BE mới là chốt chặn).
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserRole(): string | null {
  const token = getToken();
  if (!token) return null;
  const p = decodeJwt(token);
  return (p?.[ROLE_CLAIM] as string) ?? (p?.role as string) ?? null;
}

// Có quyền vào khu admin? (BE cho Admin/Manager/Staff)
export function isStaff(): boolean {
  const r = getUserRole();
  return r === "Admin" || r === "Manager" || r === "Staff";
}
