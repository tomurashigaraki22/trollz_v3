import { redirect } from "next/navigation";
import { verifyTransaction } from "@/lib/flutterwave";
import { getOrderByTransactionId, markOrderPaid, markOrderFailed } from "@/lib/queries/orders";
import { clearCart } from "@/lib/queries/cart";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CheckoutCallbackPage({ searchParams }) {
  const params = await searchParams;
  const txRef = typeof params?.tx_ref === "string" ? params.tx_ref : "";
  const transactionId = typeof params?.transaction_id === "string" ? params.transaction_id : "";
  const status = typeof params?.status === "string" ? params.status : "";

  const order = txRef ? await getOrderByTransactionId(txRef) : null;

  if (!order || status !== "successful" || !transactionId) {
    if (txRef) await markOrderFailed(txRef);
    redirect("/checkout?payment=failed");
  }

  const verification = await verifyTransaction(transactionId);
  const transaction = verification.ok ? verification.transaction : null;

  const isValid =
    transaction &&
    transaction.status === "successful" &&
    transaction.tx_ref === txRef &&
    transaction.currency === "NGN" &&
    Number(transaction.amount) >= Number(order.total_amount);

  if (!isValid) {
    await markOrderFailed(txRef);
    redirect("/checkout?payment=failed");
  }

  await markOrderPaid(txRef);

  const user = await getCurrentUser();
  if (user) {
    await clearCart(user.id);
  }

  const query = new URLSearchParams({
    tracking: order.tracking,
    total: String(order.total_amount),
    items: String(order.items.length),
  });
  redirect(`/order-confirmation?${query.toString()}`);
}
