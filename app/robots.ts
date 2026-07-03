import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // không cho index khu tài khoản / quản trị / thanh toán
      disallow: ["/account", "/admin", "/checkout", "/cart", "/login", "/register", "/verify-otp"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
