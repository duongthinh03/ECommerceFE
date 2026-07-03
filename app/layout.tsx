import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Analytics } from "@/components/analytics";
import { WishlistProvider } from "@/lib/wishlist-context";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ShopViet — Mua sắm trực tuyến",
    template: "%s · ShopViet",
  },
  description: "Cửa hàng thương mại điện tử đa ngành hàng: vợt, giày, sách và hơn thế nữa.",
  openGraph: {
    type: "website",
    siteName: "ShopViet",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* suppressHydrationWarning: extension trình duyệt (Bitdefender...) chèn attr vào body → bỏ qua cảnh báo mismatch */}
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <WishlistProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </WishlistProvider>
        <Analytics />
      </body>
    </html>
  );
}
