import PageHero from "../components/ui/PageHero";
import CheckoutClient from "../components/checkout/CheckoutClient";
import { getCurrentUser } from "@/lib/session";
import { getAddressesForUser } from "@/lib/queries/addresses";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const addresses = user ? await getAddressesForUser(user.id) : [];

  return (
    <>
      <PageHero eyebrow="Checkout" title="Checkout" />
      <CheckoutClient user={user} addresses={addresses} />
    </>
  );
}
