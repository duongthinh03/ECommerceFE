// URL gốc của storefront (để dựng link tuyệt đối cho SEO/OG/sitemap).
// Khi deploy: đặt NEXT_PUBLIC_SITE_URL = domain thật (vd https://shopviet.vn).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "ShopViet";
