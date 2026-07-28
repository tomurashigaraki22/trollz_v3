import { query } from "@/lib/db";

async function ensureBannerRow() {
  await query(
    `CREATE TABLE IF NOT EXISTS site_banner (
      id INT PRIMARY KEY,
      desktop_image_url TEXT NULL,
      mobile_image_url TEXT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
  await query(
    "INSERT INTO site_banner (id, desktop_image_url, mobile_image_url) VALUES (1, NULL, NULL) ON DUPLICATE KEY UPDATE id = id"
  );
}

export async function getBanner() {
  await ensureBannerRow();
  const rows = await query("SELECT * FROM site_banner WHERE id = 1 LIMIT 1");
  return rows[0] ?? { desktop_image_url: null, mobile_image_url: null };
}

export async function setBannerImage(slot, url) {
  await ensureBannerRow();
  const column = slot === "mobile" ? "mobile_image_url" : "desktop_image_url";
  await query(`UPDATE site_banner SET ${column} = ? WHERE id = 1`, [url]);
}

export async function resetBanner() {
  await ensureBannerRow();
  await query(
    "UPDATE site_banner SET desktop_image_url = NULL, mobile_image_url = NULL WHERE id = 1"
  );
}
