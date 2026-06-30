export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;       // ? = optional (có thể null)
  categoryId: number;
  categoryName?: string;
  brandName?: string;
  displayPrice: number;
  thumbnail?: string;
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