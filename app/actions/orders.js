"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import {
  createPendingOrder,
  cancelOrder,
  markOrderFailed,
  markOrderPaid,
  getOrderByTransactionId,
} from "@/lib/queries/orders";
import { getUserCredits, getReferralSettings } from "@/lib/queries/referrals";
import { validateCoupon } from "@/lib/queries/coupons";
import { calculateDeliveryOptions } from "@/lib/queries/delivery";
import { initializePayment, verifyTransactionByReference } from "@/lib/flutterwave";
import { SITE_URL } from "@/lib/site";

const HARD_FAILURE_STATUSES = new Set(["failed", "cancelled", "abandoned", "declined"]);

export async function checkOrderPaymentStatusAction(txRef) {
  const user = await requireUser();
  const order = await getOrderByTransactionId(txRef);

  if (!order || order.user_id !== user.id) {
    return { status: "not_found" };
  }
  if (order.payment_status === "paid") {
    return { status: "paid", tracking: order.tracking, total: order.total_amount, items: order.items.length };
  }
  if (order.payment_status === "failed") {
    return { status: "failed" };
  }

  const verification = await verifyTransactionByReference(txRef);
  const transaction = verification.ok ? verification.transaction : null;

  const isConfirmedPaid =
    transaction &&
    transaction.status === "successful" &&
    transaction.tx_ref === txRef &&
    String(transaction.currency || "").toUpperCase() === "NGN" &&
    Number(transaction.amount) >= Number(order.total_amount);

  if (isConfirmedPaid) {
    await markOrderPaid(txRef);
    return { status: "paid", tracking: order.tracking, total: order.total_amount, items: order.items.length };
  }

  if (HARD_FAILURE_STATUSES.has(transaction?.status)) {
    await markOrderFailed(txRef);
    return { status: "failed" };
  }

  return { status: "pending" };
}

export async function validateCouponAction({ code, subtotal }) {
  const user = await requireUser();
  const result = await validateCoupon({ code, subtotal, userId: user.id });
  if (!result.ok) return result;
  return {
    ok: true,
    discount: result.discount,
    code: result.coupon?.code ?? null,
    description: result.coupon?.description ?? "",
  };
}

export async function calculateDeliveryOptionsAction({ address, items, subtotal, deliveryZoneId = null }) {
  await requireUser();
  return calculateDeliveryOptions({ address, lines: items ?? [], subtotal, deliveryZoneId });
}

export async function placeOrderAction({
  addressId,
  addressText,
  address,
  items,
  subtotal,
  total,
  deliveryMode = "standard",
  deliveryZoneId = null,
  creditsToApply = 0,
  couponCode = "",
}) {
  const user = await requireUser();
  const orderSubtotal = Number(subtotal ?? total ?? 0);
  const deliveryOptions = await calculateDeliveryOptions({
    address,
    lines: items ?? [],
    subtotal: orderSubtotal,
    deliveryZoneId,
  });
  const selectedDelivery =
    deliveryOptions.find((option) => option.mode === deliveryMode) ?? deliveryOptions[0];
  if (!selectedDelivery) return { ok: false, error: "Delivery is not available for this address." };

  const deliveryFee = Number(selectedDelivery.fee || 0);
  const payableBeforeDiscount = orderSubtotal + deliveryFee;

  const [balance, settings, couponResult] = await Promise.all([
    getUserCredits(user.id),
    getReferralSettings(),
    validateCoupon({ code: couponCode, subtotal: orderSubtotal, userId: user.id }),
  ]);
  if (!couponResult.ok) return couponResult;

  const couponDiscount = Number(couponResult.discount ?? 0);
  const creditValueNgn = Number(settings.credit_value_ngn);
  const requestedCredits = Math.max(0, Math.min(Number(creditsToApply) || 0, balance));
  const maxDiscount = requestedCredits * creditValueNgn;
  const discountableAfterCoupon = Math.max(0, payableBeforeDiscount - couponDiscount);
  const discount = Math.min(maxDiscount, discountableAfterCoupon);
  const creditsUsed = creditValueNgn > 0 ? discount / creditValueNgn : 0;
  const discountedTotal = Math.max(0, payableBeforeDiscount - couponDiscount - discount);

  const transactionId = `TS_${Date.now()}_${user.id}`;

  const { tracking } = await createPendingOrder({
    userId: user.id,
    addressId,
    addressText,
    items,
    total: discountedTotal,
    subtotal: orderSubtotal,
    deliveryFee,
    deliveryMode: selectedDelivery.mode,
    deliveryZoneId: selectedDelivery.zoneId,
    deliveryZoneName: selectedDelivery.zoneName,
    estimatedDeliveryMin: selectedDelivery.minDays,
    estimatedDeliveryMax: selectedDelivery.maxDays,
    paymentMethod: discountedTotal === 0 ? "store-credit" : "flutterwave",
    transactionId,
    creditsUsed,
    coupon: couponResult.coupon,
    couponDiscount,
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
    await markOrderFailed(transactionId);
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
