"use server";

import { getCurrentUser } from "@/lib/session";
import * as cartQueries from "@/lib/queries/cart";

export async function getCartAction() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await cartQueries.getCartForUser(user.id);
  return rows.map((row) => ({
    lineId: `db-${row.id}`,
    dbId: row.id,
    productId: row.pid,
    qty: row.qty,
    size: row.size || undefined,
    color: row.color || undefined,
  }));
}

export async function addToCartAction({ productId, qty, size, color }) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await cartQueries.addToCart(user.id, { productId, qty, size, color });
  return { ok: true };
}

export async function updateCartQtyAction(dbId, qty) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await cartQueries.updateCartQty(user.id, dbId, qty);
  return { ok: true };
}

export async function removeFromCartAction(dbId) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await cartQueries.removeFromCart(user.id, dbId);
  return { ok: true };
}

export async function clearCartAction() {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await cartQueries.clearCart(user.id);
  return { ok: true };
}

export async function mergeGuestCartAction(guestItems) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Not signed in." };
  await cartQueries.mergeGuestCart(user.id, guestItems);
  return { ok: true };
}
