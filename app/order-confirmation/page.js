import PageHero from "../components/ui/PageHero";
import OrderConfirmation from "../components/checkout/OrderConfirmation";

export const metadata = {
  title: "Order Confirmation - TrollzStore",
};

export default async function OrderConfirmationPage({ searchParams }) {
  const params = await searchParams;
  const tracking = typeof params?.tracking === "string" ? params.tracking : "";
  const total = Number(params?.total) || 0;
  const items = Number(params?.items) || 0;

  return (
    <>
      <PageHero eyebrow="Order" title="Order Confirmation" />
      <OrderConfirmation tracking={tracking} total={total} items={items} />
    </>
  );
}
