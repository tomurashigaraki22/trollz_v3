"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { checkOrderPaymentStatusAction } from "@/app/actions/orders";

const POLL_INTERVAL_MS = 4000;
const SLOW_AFTER_MS = 45000;

export default function PendingPaymentClient({ txRef }) {
  const router = useRouter();
  const [status, setStatus] = useState("pending");
  const [checking, setChecking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const cancelledRef = useRef(false);

  async function poll() {
    setChecking(true);
    const result = await checkOrderPaymentStatusAction(txRef);
    if (cancelledRef.current) return;
    setChecking(false);

    if (result.status === "paid") {
      const query = new URLSearchParams({
        tracking: result.tracking,
        total: String(result.total),
        items: String(result.items),
      });
      router.push(`/order-confirmation?${query.toString()}`);
      return;
    }
    if (result.status === "failed" || result.status === "not_found") {
      setStatus("failed");
    }
  }

  useEffect(() => {
    cancelledRef.current = false;
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    const tick = setInterval(() => setElapsed(Date.now() - startedAt.current), 1000);

    return () => {
      cancelledRef.current = true;
      clearInterval(interval);
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txRef]);

  if (status === "failed") {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <h2 className="text-lg font-semibold text-ink-900">Payment not confirmed</h2>
        <p className="mt-2 text-sm text-ink-500">
          We couldn&apos;t confirm this payment went through. If money left your account, contact
          support with this reference before trying again — don&apos;t pay twice.
        </p>
        <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 font-mono text-xs text-ink-600">{txRef}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button href="/checkout">Back to Checkout</Button>
          <Button href="/contact" variant="outline">
            Contact Support
          </Button>
        </div>
      </Card>
    );
  }

  const isSlow = elapsed > SLOW_AFTER_MS;

  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-ink-900">Confirming your payment...</h2>
      <p className="mt-2 text-sm text-ink-500">
        {isSlow
          ? "This is taking longer than usual — bank transfers can occasionally take a few minutes to reflect. Please don't close this page or pay again."
          : "Bank transfers can take a minute to confirm. We'll take you to your order automatically once it's done."}
      </p>
      <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 font-mono text-xs text-ink-600">{txRef}</p>
      <button
        type="button"
        onClick={poll}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline disabled:opacity-50"
        disabled={checking}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
        {checking ? "Checking..." : "Check now"}
      </button>
    </Card>
  );
}
