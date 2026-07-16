import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { findUserByEmail } from "@/lib/queries/users";

export async function getAllSellers() {
  return query(
    `SELECT u.id, u.name, u.email, u.phone, u.status,
       (SELECT COUNT(*) FROM seller_products sp WHERE sp.seller_id = u.id) AS product_count,
       (SELECT COUNT(*) FROM seller_orders so WHERE so.seller_id = u.id) AS order_count
     FROM users u
     WHERE u.role = 'Seller'
     ORDER BY u.id DESC`
  );
}

export async function createSeller({ storeName, email, phone, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    "INSERT INTO users (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, 'Seller', 1)",
    [storeName, email.trim(), phone, hash]
  );

  return { ok: true, id: result.insertId };
}

export async function setSellerStatus(id, status) {
  await query("UPDATE users SET status = ? WHERE id = ? AND role = 'Seller'", [status ? 1 : 0, id]);
}

export async function deleteSeller(id) {
  await query("DELETE FROM seller_team WHERE seller_id = ?", [id]);
  await query("DELETE FROM seller_orders WHERE seller_id = ?", [id]);
  await query("DELETE FROM seller_products WHERE seller_id = ?", [id]);
  await query("DELETE FROM users WHERE id = ? AND role = 'Seller'", [id]);
}
