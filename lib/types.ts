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

export interface Variant {
  id: number;
  productId: number;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
}