"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { trackOrderAction } from "@/app/actions/tracking";
import { formatNaira } from "@/lib/mock/data";
import { ORDER_STATUS_STYLES } from "@/lib/orderStatus";

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const initialTracking = searchParams.get("tracking") ?? "";
  const [state, formAction, pending] = useActionState(trackOrderAction, { ok: false, error: "" });
  const order = state?.order;

  return (
    <>
      <PageHero
        eyebrow="Order Tracking"
        title="Track Your Order"
        description="Enter your Trollz order reference to see payment, order, and delivery status."
      />
      <Section>
        <div className="mx-auto max-w-2xl space-y-6">
          <Card className="p-6">
            <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
              <input
                name="tracking"
                required
                defaultValue={initialTracking}
                placeholder="e.g. TS1720000000000"
                className="min-w-0 flex-1 rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={pending}
                className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
              >
                {pending ? "Checking..." : "Track"}
              </button>
            </form>
            {state?.error && <p className="mt-3 text-sm text-danger">{state.error}</p>}
          </Card>

          {order && (
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <PackageSearch className="h-5 w-5 text-brand-500" />
                    <h2 className="font-semibold text-ink-900">Order #{order.tracking}</h2>
                  </div>
                  {order.createdAt && (
                    <p className="mt-1 text-sm text-ink-500">
                      Placed {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                    ORDER_STATUS_STYLES[order.orderStatus] ?? ORDER_STATUS_STYLES.pending
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatusBox label="Payment" value={order.paymentStatus} />
                <StatusBox label="Delivery" value={order.deliveryStatus} />
                <StatusBox label="Total" value={formatNaira(order.total)} />
              </div>

              <div className="mt-5 divide-y divide-ink-100 border-t border-ink-100 pt-3">
                {order.items.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex justify-between py-3 text-sm">
                    <span className="text-ink-700">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-medium text-ink-900">{formatNaira(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Section>
    </>
  );
}

function StatusBox({ label, value }) {
  return (
    <div className="rounded-lg bg-ink-50 p-3">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-ink-900">{value}</p>
    </div>
  );
}
