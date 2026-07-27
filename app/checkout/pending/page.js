import { redirect } from "next/navigation";
import PageHero from "../../components/ui/PageHero";
import Section from "../../components/ui/Section";
import PendingPaymentClient from "../../components/checkout/PendingPaymentClient";
import { requireUser } from "@/lib/session";
import { getOrderByTransactionId } from "@/lib/queries/orders";

export const dynamic = "force-dynamic";

export default async function CheckoutPendingPage({ searchParams }) {
  const params = await searchParams;
  const txRef = typeof params?.tx_ref === "string" ? params.tx_ref : "";

  if (!txRef) {
    redirect("/checkout");
  }

  const user = await requireUser();
  const order = await getOrderByTransactionId(txRef);

  if (!order || order.user_id !== user.id) {
    redirect("/checkout");
  }

  if (order.payment_status === "paid") {
    const query = new URLSearchParams({
      tracking: order.tracking,
      total: String(order.total_amount),
      items: String(order.items.length),
    });
    redirect(`/order-confirmation?${query.toString()}`);
  }

  return (
    <>
      <PageHero eyebrow="Checkout" title="Confirming Payment" />
      <Section>
        <PendingPaymentClient txRef={txRef} />
      </Section>
    </>
  );
}
