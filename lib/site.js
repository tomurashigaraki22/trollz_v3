export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trollzstore.com.ng";
export const SITE_NAME = "TrollzStore";

// The seller dashboard (trollz_seller) is a separate Next.js app — uploaded
// seller-application documents live on its filesystem, so we need its
// origin to build absolute, viewable URLs from the admin app.
export const SELLER_SITE_URL = process.env.NEXT_PUBLIC_SELLER_SITE_URL ?? "https://seller.trollzstore.com.ng";
