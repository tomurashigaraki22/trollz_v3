"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { createPendingOrder, cancelOrder } from "@/lib/queries/orders";
import { initializePayment } from "@/lib/flutterwave";
import { SITE_URL } from "@/lib/site";

export async function placeOrderAction({ addressId, addressText, items, total }) {
  const user = await requireUser();

  const transactionId = `TS_${Date.now()}_${user.id}`;

  const { tracking } = await createPendingOrder({
    userId: user.id,
    addressId,
    addressText,
    items,
    total,
    paymentMethod: "flutterwave",
    transactionId,
  });

  const payment = await initializePayment({
    txRef: transactionId,
    amount: total,
    email: user.email,
    name: user.name,
    phone: user.phone,
    redirectUrl: `${SITE_URL}/checkout/callback`,
  });

  if (!payment.ok) {
    return { ok: false, error: payment.error };
  }

  return { ok: true, tracking, paymentLink: payment.link };
}

export async function cancelOrderAction(orderId) {
  const user = await requireUser();
  const result = await cancelOrder(user.id, orderId);
  revalidatePath("/account/orders");
  return result;
}
