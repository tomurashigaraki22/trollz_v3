export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://trollzstore.com.ng";
export const SITE_NAME = "TrollzStore";
export const SITE_DESCRIPTION =
  "Nigeria's everyday shopping destination for fashion, electronics, home & lifestyle, beauty, and general merchandise.";
export const DEFAULT_OG_IMAGE = "/opengraph-image";

// The seller dashboard (trollz_seller) is a separate Next.js app — uploaded
// seller-application documents live on its filesystem, so we need its
// origin to build absolute, viewable URLs from the admin app.
export const SELLER_SITE_URL = process.env.NEXT_PUBLIC_SELLER_SITE_URL ?? "https://seller.trollzstore.com.ng";

export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return SITE_URL;
  try {
    return new URL(pathOrUrl, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
}

export function truncateMeta(value, max = 155) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}
