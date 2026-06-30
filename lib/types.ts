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