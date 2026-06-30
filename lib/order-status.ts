// Nhãn + màu badge cho trạng thái đơn & thanh toán. Khớp enum BE (trả dạng chuỗi).

export const ORDER_STATUSES = [
  "Pending", "Confirmed", "Packing", "Shipping", "Delivered", "Completed", "Cancelled", "Refunded",
] as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ xác nhận",
  Confirmed: "Đã xác nhận",
  Packing: "Đang đóng gói",
  Shipping: "Đang giao",
  Delivered: "Đã giao",
  Completed: "Hoàn tất",
  Cancelled: "Đã hủy",
  Refunded: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  Unpaid: "Chưa thanh toán",
  Pending: "Đang xử lý",
  Paid: "Đã thanh toán",
  Failed: "Thất bại",
  Refunded: "Đã hoàn tiền",
};

type BadgeVariant = "default" | "secondary" | "success" | "destructive" | "outline";

export function orderStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "Delivered":
    case "Completed":
      return "success";
    case "Cancelled":
    case "Refunded":
      return "destructive";
    case "Pending":
      return "secondary";
    default: // Confirmed / Packing / Shipping
      return "default";
  }
}

export function paymentStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "Paid":
      return "success";
    case "Failed":
      return "destructive";
    default:
      return "secondary";
  }
}
