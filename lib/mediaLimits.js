export const PRODUCT_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const PRODUCT_VIDEO_MAX_DURATION_SECONDS = 60;
export const BANNER_VIDEO_MAX_BYTES = 20 * 1024 * 1024;
export const BANNER_VIDEO_MAX_DURATION_SECONDS = 15;
export const PRODUCT_VIDEO_ACCEPT = "video/mp4,video/webm";
export const BANNER_MEDIA_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm";

export function formatMegabytes(bytes) {
  return `${Math.round(bytes / (1024 * 1024))}MB`;
}
