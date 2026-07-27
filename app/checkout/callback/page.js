import { redirect } from "next/navigation";
import { verifyTransaction, verifyTransactionByReference } from "@/lib/flutterwave";
import { getOrderByTransactionId, markOrderPaid, markOrderFailed } from "@/lib/queries/orders";
import { clearCart } from "@/lib/queries/cart";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const HARD_FAILURE_STATUSES = new Set(["failed", "cancelled", "abandoned", "declined"]);

function confirmationRedirectUrl(order) {
  const query = new URLSearchParams({
    tracking: order.tracking,
    total: String(order.total_amount),
    items: String(order.items.length),
  });
  return `/order-confirmation?${query.toString()}`;
}

export default async function CheckoutCallbackPage({ searchParams }) {
  const params = await searchParams;
  const txRef = typeof params?.tx_ref === "string" ? params.tx_ref : "";
  const transactionId = typeof params?.transaction_id === "string" ? params.transaction_id : "";

  if (!transactionId && !txRef) {
    redirect("/checkout?payment=failed");
  }

  const verification = transactionId
    ? await verifyTransaction(transactionId)
    : await verifyTransactionByReference(txRef);
  const transaction = verification.ok ? verification.transaction : null;
  const verifiedTxRef = transaction?.tx_ref || txRef;
  const order = verifiedTxRef ? await getOrderByTransactionId(verifiedTxRef) : null;

  if (!order) {
    redirect("/checkout?payment=failed");
  }

  // The webhook (or a previous load of this page) may have already
  // confirmed payment before this request finished — don't re-verify, just
  // finish checkout.
  if (order.payment_status === "paid") {
    const user = await getCurrentUser();
    if (user) await clearCart(user.id);
    redirect(confirmationRedirectUrl(order));
  }

  const isConfirmedPaid =
    transaction &&
    transaction.status === "successful" &&
    transaction.tx_ref === verifiedTxRef &&
    String(transaction.currency || "").toUpperCase() === "NGN" &&
    Number(transaction.amount) >= Number(order.total_amount);

  if (isConfirmedPaid) {
    await markOrderPaid(verifiedTxRef);
    const user = await getCurrentUser();
    if (user) await clearCart(user.id);
    redirect(confirmationRedirectUrl(order));
  }

  const isHardFailure = HARD_FAILURE_STATUSES.has(transaction?.status);

  if (isHardFailure) {
    await markOrderFailed(verifiedTxRef);
    redirect("/checkout?payment=failed");
  }

  // Anything else (pending, still processing, or verification briefly
  // failing) is NOT a confirmed failure — this is the normal state for a
  // bank transfer that's still settling. Telling the customer "payment
  // failed" here would be false and risks them paying twice. Send them to a
  // page that waits for the webhook to confirm instead.
  redirect(`/checkout/pending?tx_ref=${encodeURIComponent(verifiedTxRef)}`);
}
