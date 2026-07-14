"use client";

import { CheckCircle2 } from "lucide-react";
import Section from "../ui/Section";
import Button from "../ui/Button";
import { formatNaira } from "@/lib/mock/data";

export default function OrderConfirmation({ tracking, total, items }) {
  if (!tracking) {
    return (
      <Section>
        <div className="mx-auto max-w-md py-10 text-center">
          <p className="text-sm text-ink-500">No order found.</p>
          <Button href="/shop" className="mt-6">
            Continue Shopping
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="mx-auto max-w-lg py-6 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-5 text-2xl font-bold text-ink-900">Payment Successful!</h1>
        <p className="mt-2 text-sm leading-6 text-ink-500">
          Thank you for shopping with TrollzStore. Your order has been placed and is being
          processed.
        </p>

        <div className="mt-6 rounded-2xl border border-ink-100 p-6 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-ink-500">Order Reference</span>
            <span className="font-semibold text-ink-900">{tracking}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ink-500">Items</span>
            <span className="font-semibold text-ink-900">{items}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-ink-500">Amount Paid</span>
            <span className="font-semibold text-ink-900">{formatNaira(total)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/">Home</Button>
          <Button href="/account/orders" variant="outline">
            View My Orders
          </Button>
          <Button href="/shop" variant="ghost">
            Continue Shopping
          </Button>
        </div>
      </div>
    </Section>
  );
}
