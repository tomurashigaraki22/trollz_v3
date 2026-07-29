import { query } from "@/lib/db";

function safeJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function ensureBannerRow() {
  await query(
    `CREATE TABLE IF NOT EXISTS site_banner (
      id INT PRIMARY KEY,
      desktop_image_url TEXT NULL,
      mobile_image_url TEXT NULL,
      desktop_image_urls TEXT NULL,
      mobile_image_urls TEXT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
  const columns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'site_banner'"
  );
  const existing = new Set(columns.map((row) => row.COLUMN_NAME || row.column_name));
  if (!existing.has("desktop_image_urls")) {
    await query("ALTER TABLE site_banner ADD COLUMN desktop_image_urls TEXT NULL AFTER desktop_image_url");
  }
  if (!existing.has("mobile_image_urls")) {
    await query("ALTER TABLE site_banner ADD COLUMN mobile_image_urls TEXT NULL AFTER mobile_image_url");
  }
  await query(
    "INSERT INTO site_banner (id, desktop_image_url, mobile_image_url) VALUES (1, NULL, NULL) ON DUPLICATE KEY UPDATE id = id"
  );
}

export async function getBanner() {
  await ensureBannerRow();
  const rows = await query("SELECT * FROM site_banner WHERE id = 1 LIMIT 1");
  const banner = rows[0] ?? {};
  const desktopImages = safeJsonArray(banner.desktop_image_urls);
  const mobileImages = safeJsonArray(banner.mobile_image_urls);
  if (banner.desktop_image_url && !desktopImages.includes(banner.desktop_image_url)) {
    desktopImages.unshift(banner.desktop_image_url);
  }
  if (banner.mobile_image_url && !mobileImages.includes(banner.mobile_image_url)) {
    mobileImages.unshift(banner.mobile_image_url);
  }
  return {
    ...banner,
    desktop_image_url: desktopImages[0] ?? null,
    mobile_image_url: mobileImages[0] ?? null,
    desktop_image_urls: desktopImages,
    mobile_image_urls: mobileImages,
  };
}

export async function addBannerImage(slot, url) {
  await ensureBannerRow();
  const banner = await getBanner();
  const urls = slot === "mobile" ? banner.mobile_image_urls : banner.desktop_image_urls;
  const nextUrls = [...urls.filter((item) => item !== url), url];
  if (slot === "mobile") {
    await query("UPDATE site_banner SET mobile_image_url = ?, mobile_image_urls = ? WHERE id = 1", [
      nextUrls[0] ?? null,
      JSON.stringify(nextUrls),
    ]);
  } else {
    await query("UPDATE site_banner SET desktop_image_url = ?, desktop_image_urls = ? WHERE id = 1", [
      nextUrls[0] ?? null,
      JSON.stringify(nextUrls),
    ]);
  }
}

export async function resetBanner() {
  await ensureBannerRow();
  await query(
    "UPDATE site_banner SET desktop_image_url = NULL, mobile_image_url = NULL, desktop_image_urls = NULL, mobile_image_urls = NULL WHERE id = 1"
  );
}
