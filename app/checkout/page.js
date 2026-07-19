import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import CheckoutClient from "../components/checkout/CheckoutClient";
import { getCurrentUser } from "@/lib/session";
import { getAddressesForUser } from "@/lib/queries/addresses";
import { getUserCredits, getReferralSettings } from "@/lib/queries/referrals";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }) {
  const params = await searchParams;
  const paymentFailed = params?.payment === "failed";

  const user = await getCurrentUser();
  const [addresses, creditBalance, referralSettings] = user
    ? await Promise.all([
        getAddressesForUser(user.id),
        getUserCredits(user.id),
        getReferralSettings(),
      ])
    : [[], 0, null];

  return (
    <>
      <PageHero eyebrow="Checkout" title="Checkout" />
      {paymentFailed && (
        <Section className="pb-0">
          <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            Your payment could not be verified, so the order was not placed. No charge was
            completed — please try again.
          </div>
        </Section>
      )}
      <CheckoutClient
        user={user}
        addresses={addresses}
        creditBalance={creditBalance}
        creditValueNgn={referralSettings ? Number(referralSettings.credit_value_ngn) : 0}
      />
    </>
  );
}
