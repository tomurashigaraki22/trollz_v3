"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { createPendingOrder, cancelOrder, markOrderPaid } from "@/lib/queries/orders";
import { getUserCredits, getReferralSettings } from "@/lib/queries/referrals";
import { initializePayment } from "@/lib/flutterwave";
import { SITE_URL } from "@/lib/site";

export async function placeOrderAction({ addressId, addressText, items, total, creditsToApply = 0 }) {
  const user = await requireUser();

  // Never trust a client-supplied discount — reclamp against the real
  // balance and the admin-configured conversion rate.
  const [balance, settings] = await Promise.all([getUserCredits(user.id), getReferralSettings()]);
  const creditValueNgn = Number(settings.credit_value_ngn);
  const requestedCredits = Math.max(0, Math.min(Number(creditsToApply) || 0, balance));
  const maxDiscount = requestedCredits * creditValueNgn;
  const discount = Math.min(maxDiscount, total);
  const creditsUsed = creditValueNgn > 0 ? discount / creditValueNgn : 0;
  const discountedTotal = Math.max(0, total - discount);

  const transactionId = `TS_${Date.now()}_${user.id}`;

  const { tracking } = await createPendingOrder({
    userId: user.id,
    addressId,
    addressText,
    items,
    total: discountedTotal,
    paymentMethod: discountedTotal === 0 ? "store-credit" : "flutterwave",
    transactionId,
    creditsUsed,
  });

  if (discountedTotal === 0) {
    await markOrderPaid(transactionId);
    return { ok: true, tracking, paymentLink: null };
  }

  const payment = await initializePayment({
    txRef: transactionId,
    amount: discountedTotal,
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
