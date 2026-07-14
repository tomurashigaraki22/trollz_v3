"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { createOrder, cancelOrder } from "@/lib/queries/orders";

export async function placeOrderAction({ addressId, addressText, items, total }) {
  const user = await requireUser();

  // Payment is simulated (no real Flutterwave integration yet) — the order
  // itself is a real row, just with a placeholder transaction reference.
  const transactionId = `demo_txn_${Date.now()}`;

  const { orderId, tracking } = await createOrder({
    userId: user.id,
    addressId,
    addressText,
    items,
    total,
    paymentMethod: "flutterwave",
    transactionId,
  });

  revalidatePath("/account/orders");
  return { ok: true, orderId, tracking };
}

export async function cancelOrderAction(orderId) {
  const user = await requireUser();
  const result = await cancelOrder(user.id, orderId);
  revalidatePath("/account/orders");
  return result;
}
