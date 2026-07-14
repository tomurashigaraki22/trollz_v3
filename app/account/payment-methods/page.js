import PaymentMethodsManager from "../../components/account/PaymentMethodsManager";
import { getCurrentUser } from "@/lib/session";
import { getPaymentMethodsForUser } from "@/lib/queries/paymentMethods";

export const dynamic = "force-dynamic";

export default async function PaymentMethodsPage() {
  const user = await getCurrentUser();
  const paymentMethods = await getPaymentMethodsForUser(user.id);

  return <PaymentMethodsManager paymentMethods={paymentMethods} />;
}
