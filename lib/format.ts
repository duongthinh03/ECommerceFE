// Format tiền VND nhất quán toàn site: 1500000 -> "1.500.000 ₫"
export function formatVND(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

// Số gọn kiểu thương mại: 1200 -> "1,2k", 15000 -> "15k" (dùng cho "đã bán")
export function formatCompact(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k % 1 === 0 ? k : k.toFixed(1).replace(".", ",")}k`;
}
