import { query } from "@/lib/db";
import { serializeOptionMap } from "@/lib/productOptions";

let cartSchemaReady = false;

async function ensureCartSchema() {
  if (cartSchemaReady) return;
  const columns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'cart'"
  );
  const existing = new Set(columns.map((row) => row.COLUMN_NAME || row.column_name));
  if (!existing.has("selected_options")) {
    await query("ALTER TABLE cart ADD COLUMN selected_options TEXT NULL");
  }
  cartSchemaReady = true;
}

export async function getCartForUser(userId) {
  await ensureCartSchema();
  return query("SELECT * FROM cart WHERE userid = ? ORDER BY id", [userId]);
}

export async function addToCart(userId, { productId, qty, size, color, options }) {
  await ensureCartSchema();
  const selectedOptions = serializeOptionMap(options);
  const existing = await query(
    "SELECT * FROM cart WHERE userid = ? AND pid = ? AND size <=> ? AND color <=> ? AND selected_options <=> ? LIMIT 1",
    [userId, productId, size ?? null, color ?? null, selectedOptions]
  );

  if (existing.length > 0) {
    await query("UPDATE cart SET qty = qty + ? WHERE id = ?", [qty, existing[0].id]);
  } else {
    await query("INSERT INTO cart (userid, pid, qty, size, color, selected_options) VALUES (?, ?, ?, ?, ?, ?)", [
      userId,
      productId,
      qty,
      size ?? "",
      color ?? "",
      selectedOptions,
    ]);
  }
}

export async function updateCartQty(userId, id, qty) {
  await ensureCartSchema();
  await query("UPDATE cart SET qty = ? WHERE id = ? AND userid = ?", [qty, id, userId]);
}

export async function removeFromCart(userId, id) {
  await ensureCartSchema();
  await query("DELETE FROM cart WHERE id = ? AND userid = ?", [id, userId]);
}

export async function clearCart(userId) {
  await ensureCartSchema();
  await query("DELETE FROM cart WHERE userid = ?", [userId]);
}

export async function mergeGuestCart(userId, guestItems) {
  for (const item of guestItems) {
    await addToCart(userId, item);
  }
}
