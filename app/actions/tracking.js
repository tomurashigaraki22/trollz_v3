"use server";

import { getOrderByTracking } from "@/lib/queries/orders";

export async function trackOrderAction(_previousState, formData) {
  const tracking = String(formData.get("tracking") || "").trim();
  if (!tracking) return { ok: false, error: "Enter your order reference." };

  const order = await getOrderByTracking(tracking);
  if (!order) return { ok: false, error: "No order found with that reference." };

  return {
    ok: true,
    order: {
      tracking: order.tracking,
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      deliveryStatus: order.delivery_status,
      total: Number(order.total_amount),
      address: order.address,
      createdAt: order.created_at ? new Date(order.created_at).toISOString() : null,
      items: order.items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
      })),
    },
  };
}
