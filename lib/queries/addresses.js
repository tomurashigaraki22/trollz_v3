import { query } from "@/lib/db";

export async function getAddressesForUser(userId) {
  return query(
    "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC",
    [userId]
  );
}

export async function addAddress(userId, address) {
  if (address.isDefault) {
    await query("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
  }
  const result = await query(
    `INSERT INTO user_addresses
      (user_id, full_name, phone, email, address1, address2, city, state, country, postal_code, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      address.fullName,
      address.phone,
      address.email ?? null,
      address.address1,
      address.address2 || "",
      address.city,
      address.state,
      address.country,
      address.postalCode || null,
      address.isDefault ? 1 : 0,
    ]
  );
  return result.insertId;
}

export async function updateAddress(userId, id, address) {
  if (address.isDefault) {
    await query("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
  }
  await query(
    `UPDATE user_addresses SET
      full_name = ?, phone = ?, address1 = ?, address2 = ?, city = ?, state = ?,
      country = ?, postal_code = ?, is_default = ?
     WHERE id = ? AND user_id = ?`,
    [
      address.fullName,
      address.phone,
      address.address1,
      address.address2 || "",
      address.city,
      address.state,
      address.country,
      address.postalCode || null,
      address.isDefault ? 1 : 0,
      id,
      userId,
    ]
  );
}

export async function deleteAddress(userId, id) {
  await query("DELETE FROM user_addresses WHERE id = ? AND user_id = ?", [id, userId]);
}

export async function setDefaultAddress(userId, id) {
  await query("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?", [userId]);
  await query("UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?", [id, userId]);
}
