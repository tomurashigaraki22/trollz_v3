import { query } from "@/lib/db";

export async function getBanner() {
  const rows = await query("SELECT * FROM site_banner WHERE id = 1 LIMIT 1");
  return rows[0] ?? { desktop_image_url: null, mobile_image_url: null };
}

export async function setBannerImage(slot, url) {
  const column = slot === "mobile" ? "mobile_image_url" : "desktop_image_url";
  await query(`UPDATE site_banner SET ${column} = ? WHERE id = 1`, [url]);
}

export async function resetBanner() {
  await query(
    "UPDATE site_banner SET desktop_image_url = NULL, mobile_image_url = NULL WHERE id = 1"
  );
}
