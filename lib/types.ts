// Khớp PagedResult<T> của BE
export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;       // ? = optional (có thể null)
  categoryId: number;
  categoryName?: string;
  brandId?: number | null;
  brandName?: string;
  displayPrice: number;
  thumbnail?: string;
  isActive: boolean;
  inStock?: boolean;   // còn hàng? (có ≥1 variant còn tồn)
  avgRating?: number;  // điểm đánh giá TB (0 nếu chưa có)
  reviewCount?: number;
  soldCount?: number;  // đã bán
}

export interface Dashboard {
  revenueToday: number;
  revenueThisMonth: number;
  revenueAllTime: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  ordersByStatus: { status: string; count: number }[];
  revenueDaily: { date: string; revenue: number }[];      // 30 ngày
  revenueMonthly: { month: string; revenue: number }[];   // 12 tháng
  topProducts: { productId: number; name: string; soldQty: number; revenue: number }[];
  lowStock: { productId: number; productName: string; sku: string; optionName?: string | null; stock: number }[];
}

export interface Profile {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;   // "yyyy-MM-dd"
  gender?: string | null;        // "Male" | "Female" | "Other"
  provider?: string | null;
  emailConfirmed: boolean;
  is2FAEnabled: boolean;
  hasPassword: boolean;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  count: number;
  canReview: boolean;   // đã mua & chưa đánh giá
  hasReviewed: boolean;
  items: Review[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  sortOrder: number;
  isActive: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: string;          // "Percent" | "Fixed"
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount: number;
  usageLimit?: number | null;
  usedCount: number;
  userUsageLimit?: number | null;
  startsAt?: string | null;
  expiredAt?: string | null;
  isActive: boolean;
}

export interface OrderItem {
  productId: number;
  variantId: number;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  finalPrice: number;
}

export interface Order {
  id: number;
  orderCode: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  shipRecipient: string;
  shipPhone: string;
  shipAddress: string;
  note?: string;
  paymentQrUrl?: string | null;   // đơn SePay chưa thanh toán → có QR
  createdAt: string;
  items: OrderItem[];
}

export interface Address {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressLine: string;
  isDefault: boolean;
}

// Payload tạo/sửa địa chỉ (không gồm id)
export type AddressInput = Omit<Address, "id">;

export interface ProductImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
  sortOrder: number;
}

export interface Variant {
  id: number;
  productId: number;
  sku: string;
  optionName?: string | null;   // nhãn hiển thị (vd "3U") — không có thì hiện SKU
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl?: string;
  weight?: number | null;
  isActive: boolean;
}