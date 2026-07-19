import PaymentMethodsManager from "../../components/account/PaymentMethodsManager";
import { requireUser } from "@/lib/session";
import { getPaymentMethodsForUser } from "@/lib/queries/paymentMethods";

export const dynamic = "force-dynamic";

export default async function PaymentMethodsPage() {
  const user = await requireUser();
  const paymentMethods = await getPaymentMethodsForUser(user.id);

  return <PaymentMethodsManager paymentMethods={paymentMethods} />;
}
