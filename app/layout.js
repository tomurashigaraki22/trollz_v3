import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "./components/layout/SiteChrome";
import { AuthProvider } from "./components/auth/AuthProvider";
import { CartProvider } from "./components/cart/CartProvider";
import { WishlistProvider } from "./components/wishlist/WishlistProvider";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { getCurrentUser } from "@/lib/session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - General eCommerce Store`,
    template: `%s - ${SITE_NAME}`,
  },
  description:
    "TrollzStore — Nigeria's everyday shopping destination for fashion, electronics, home & lifestyle, and beauty.",
  keywords: ["Trollz Store", "General merchandise", "Nigeria online store"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - General eCommerce Store`,
    description:
      "Nigeria's everyday shopping destination for fashion, electronics, home & lifestyle, and beauty.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - General eCommerce Store`,
    description:
      "Nigeria's everyday shopping destination for fashion, electronics, home & lifestyle, and beauty.",
  },
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-ink-900">
        <AuthProvider initialUser={user}>
          <CartProvider>
            <WishlistProvider>
              <SiteChrome>{children}</SiteChrome>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
