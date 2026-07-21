import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteChrome from "./components/layout/SiteChrome";
import { AuthProvider } from "./components/auth/AuthProvider";
import { CartProvider } from "./components/cart/CartProvider";
import { WishlistProvider } from "./components/wishlist/WishlistProvider";
import { CompareProvider } from "./components/compare/CompareProvider";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_URL, SITE_NAME } from "@/lib/site";
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
  description: SITE_DESCRIPTION,
  keywords: ["Trollz Store", "General merchandise", "Nigeria online store"],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - General eCommerce Store`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - General eCommerce Store`,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
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
              <CompareProvider>
                <SiteChrome>{children}</SiteChrome>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
