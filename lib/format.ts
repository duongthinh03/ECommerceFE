// Format tiền VND nhất quán toàn site: 1500000 -> "1.500.000 ₫"
export function formatVND(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}
