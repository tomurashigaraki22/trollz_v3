"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatNaira } from "@/lib/mock/data";
import { ORDER_STATUS_STYLES, CANCELLABLE_STATUSES } from "@/lib/orderStatus";
import { cancelOrderAction } from "@/app/actions/orders";

export default function OrdersList({ orders }) {
  const [expandedId, setExpandedId] = useState(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (orders.length === 0) {
    return <p className="text-sm text-ink-500">You haven&apos;t placed any orders yet.</p>;
  }

  function handleCancel(orderId) {
    startTransition(async () => {
      await cancelOrderAction(orderId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const isExpanded = expandedId === order.id;
        const canCancel = CANCELLABLE_STATUSES.includes(order.order_status);

        return (
          <Card key={order.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">Order #{order.tracking}</p>
                <p className="text-xs text-ink-500">
                  Placed {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${ORDER_STATUS_STYLES[order.order_status]}`}
              >
                {order.order_status}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="mt-3 text-sm font-medium text-brand-600 hover:underline"
            >
              {isExpanded ? "Hide details" : "View details"}
            </button>

            {isExpanded && (
              <div className="mt-4 space-y-2 border-t border-ink-100 pt-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-ink-700">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="text-ink-500">{formatNaira(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
              <span className="text-sm font-semibold text-ink-900">
                Total: {formatNaira(order.total_amount)}
              </span>
              {canCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleCancel(order.id)}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
