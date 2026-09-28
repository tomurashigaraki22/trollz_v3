import { query } from "@/lib/db";

let schemaReady = false;

async function ensureSellerBannerAdsTable() {
  if (schemaReady) return;
  await query(
    `CREATE TABLE IF NOT EXISTS seller_banner_ads (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      seller_id INT NOT NULL,
      plan_code VARCHAR(32) NOT NULL,
      amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
      image_url TEXT NOT NULL,
      target_url TEXT NULL,
      tx_ref VARCHAR(160) NOT NULL UNIQUE,
      transaction_id VARCHAR(100) NULL,
      payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      starts_at DATETIME NULL,
      expires_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_seller_banner_ads_live (status, payment_status, starts_at, expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
  schemaReady = true;
}

export async function getActiveSellerBannerAds(limit = 8) {
  try {
    await ensureSellerBannerAdsTable();
    const rows = await query(
      `SELECT a.id, a.image_url, a.target_url, a.expires_at, u.name AS seller_name
       FROM seller_banner_ads a
       JOIN users u ON u.id = a.seller_id AND u.role = 'Seller' AND u.status = 1
       WHERE a.status = 'active'
         AND a.payment_status = 'paid'
         AND (a.starts_at IS NULL OR a.starts_at <= UTC_TIMESTAMP())
         AND (a.expires_at IS NULL OR a.expires_at > UTC_TIMESTAMP())
       ORDER BY a.id DESC
       LIMIT ?`,
      [limit]
    );
    return rows.map((row) => ({
      ...row,
      expires_at: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    }));
  } catch (error) {
    console.error("Unable to load seller banner ads:", error?.message || error);
    return [];
  }
}
