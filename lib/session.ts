export function getSessionId(): string {
  if (typeof window === "undefined") return "";   // chặn chạy phía server
  let id = localStorage.getItem("cart_session_id");
  if (!id) {
    id = crypto.randomUUID();                      // sinh guid mới
    localStorage.setItem("cart_session_id", id);
  }
  return id;
}