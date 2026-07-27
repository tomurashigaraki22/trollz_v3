import { query } from "@/lib/db";

let couponTablesReady = false;

async function ensureCouponTables() {
  if (couponTablesReady) return;

  await query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(255) NULL,
      discount_type ENUM('percent','fixed') NOT NULL DEFAULT 'fixed',
      discount_value DECIMAL(12,2) NOT NULL DEFAULT 0,
      min_order_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      usage_limit INT NULL,
      used_count INT NOT NULL DEFAULT 0,
      starts_at DATETIME NULL,
      expires_at DATETIME NULL,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS coupon_redemptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      coupon_id INT NOT NULL,
      user_id INT NOT NULL,
      order_id INT NULL,
      discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX coupon_redemptions_coupon_idx (coupon_id),
      INDEX coupon_redemptions_user_idx (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await query(
    `INSERT IGNORE INTO coupons
      (code, description, discount_type, discount_value, min_order_amount, usage_limit, active)
     VALUES ('WELCOME10', '10% off your next Trollz order', 'percent', 10, 0, NULL, 1)`
  );

  couponTablesReady = true;
}

export async function getCouponByCode(code) {
  await ensureCouponTables();
  const rows = await query("SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) LIMIT 1", [
    code.trim(),
  ]);
  return rows[0] ?? null;
}

export async function validateCoupon({ code, subtotal, userId }) {
  const cleanCode = String(code || "").trim();
  if (!cleanCode) return { ok: true, coupon: null, discount: 0 };

  const coupon = await getCouponByCode(cleanCode);
  if (!coupon || !coupon.active) return { ok: false, error: "Coupon code is not valid." };

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { ok: false, error: "This coupon is not active yet." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { ok: false, error: "This coupon has expired." };
  }
  if (coupon.usage_limit && Number(coupon.used_count) >= Number(coupon.usage_limit)) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }
  if (Number(subtotal) < Number(coupon.min_order_amount)) {
    return { ok: false, error: `This coupon requires an order of at least N${Number(coupon.min_order_amount).toLocaleString()}.` };
  }

  const [existing] = await query(
    "SELECT id FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ? LIMIT 1",
    [coupon.id, userId]
  );
  if (existing) return { ok: false, error: "You have already used this coupon." };

  const rawDiscount =
    coupon.discount_type === "percent"
      ? (Number(subtotal) * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);
  const discount = Math.max(0, Math.min(Number(subtotal), rawDiscount));

  return { ok: true, coupon, discount };
}

export async function getAllCoupons() {
  await ensureCouponTables();
  return query("SELECT * FROM coupons ORDER BY id DESC");
}

export async function createCoupon({
  code,
  description,
  discountType,
  discountValue,
  minOrderAmount,
  usageLimit,
  startsAt,
  expiresAt,
}) {
  await ensureCouponTables();
  const cleanCode = String(code || "").trim().toUpperCase();
  if (!cleanCode) return { ok: false, error: "A coupon code is required." };

  const existing = await getCouponByCode(cleanCode);
  if (existing) return { ok: false, error: "A coupon with this code already exists." };

  await query(
    `INSERT INTO coupons
      (code, description, discount_type, discount_value, min_order_amount, usage_limit, starts_at, expires_at, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      cleanCode,
      description || null,
      discountType,
      discountValue,
      minOrderAmount || 0,
      usageLimit || null,
      startsAt || null,
      expiresAt || null,
    ]
  );
  return { ok: true };
}

export async function updateCoupon(id, {
  description,
  discountType,
  discountValue,
  minOrderAmount,
  usageLimit,
  startsAt,
  expiresAt,
}) {
  await ensureCouponTables();
  await query(
    `UPDATE coupons SET
      description = ?, discount_type = ?, discount_value = ?, min_order_amount = ?,
      usage_limit = ?, starts_at = ?, expires_at = ?
     WHERE id = ?`,
    [
      description || null,
      discountType,
      discountValue,
      minOrderAmount || 0,
      usageLimit || null,
      startsAt || null,
      expiresAt || null,
      id,
    ]
  );
}

export async function setCouponActive(id, active) {
  await ensureCouponTables();
  await query("UPDATE coupons SET active = ? WHERE id = ?", [active ? 1 : 0, id]);
}

export async function deleteCoupon(id) {
  await ensureCouponTables();
  await query("DELETE FROM coupon_redemptions WHERE coupon_id = ?", [id]);
  await query("DELETE FROM coupons WHERE id = ?", [id]);
}

export async function redeemCoupon({ couponId, userId, orderId, discount }) {
  if (!couponId || discount <= 0) return;
  await ensureCouponTables();
  await query(
    "INSERT INTO coupon_redemptions (coupon_id, user_id, order_id, discount_amount) VALUES (?, ?, ?, ?)",
    [couponId, userId, orderId ?? null, discount]
  );
  await query("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [couponId]);
}
