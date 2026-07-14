import crypto from "crypto";
import { query } from "@/lib/db";

export async function getPaymentMethodsForUser(userId) {
  return query(
    "SELECT * FROM user_payment_methods WHERE user_id = ? ORDER BY is_default DESC, id DESC",
    [userId]
  );
}

// Real card capture happens on Flutterwave's hosted checkout — we never see
// or store raw card numbers. Until that integration exists, `authorization_code`
// is a placeholder standing in for what Flutterwave's tokenized reference
// would be, so this demo flow still writes a real row rather than nothing.
export async function addPaymentMethod(userId, { brand, last4, expiry, isDefault }) {
  if (isDefault) {
    await query("UPDATE user_payment_methods SET is_default = 0 WHERE user_id = ?", [userId]);
  }
  const authorizationCode = `demo_${crypto.randomBytes(12).toString("hex")}`;
  const result = await query(
    `INSERT INTO user_payment_methods (user_id, authorization_code, card_brand, card_last4, expiry, is_default)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, authorizationCode, brand, last4, expiry, isDefault ? 1 : 0]
  );
  return result.insertId;
}

export async function deletePaymentMethod(userId, id) {
  await query("DELETE FROM user_payment_methods WHERE id = ? AND user_id = ?", [id, userId]);
}

export async function setDefaultPaymentMethod(userId, id) {
  await query("UPDATE user_payment_methods SET is_default = 0 WHERE user_id = ?", [userId]);
  await query("UPDATE user_payment_methods SET is_default = 1 WHERE id = ? AND user_id = ?", [
    id,
    userId,
  ]);
}
