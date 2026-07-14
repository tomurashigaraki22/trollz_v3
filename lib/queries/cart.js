import { query } from "@/lib/db";

export async function getCartForUser(userId) {
  return query("SELECT * FROM cart WHERE userid = ? ORDER BY id", [userId]);
}

export async function addToCart(userId, { productId, qty, size, color }) {
  const existing = await query(
    "SELECT * FROM cart WHERE userid = ? AND pid = ? AND size <=> ? AND color <=> ? LIMIT 1",
    [userId, productId, size ?? null, color ?? null]
  );

  if (existing.length > 0) {
    await query("UPDATE cart SET qty = qty + ? WHERE id = ?", [qty, existing[0].id]);
  } else {
    await query("INSERT INTO cart (userid, pid, qty, size, color) VALUES (?, ?, ?, ?, ?)", [
      userId,
      productId,
      qty,
      size ?? "",
      color ?? "",
    ]);
  }
}

export async function updateCartQty(userId, id, qty) {
  await query("UPDATE cart SET qty = ? WHERE id = ? AND userid = ?", [qty, id, userId]);
}

export async function removeFromCart(userId, id) {
  await query("DELETE FROM cart WHERE id = ? AND userid = ?", [id, userId]);
}

export async function clearCart(userId) {
  await query("DELETE FROM cart WHERE userid = ?", [userId]);
}

export async function mergeGuestCart(userId, guestItems) {
  for (const item of guestItems) {
    await addToCart(userId, item);
  }
}
