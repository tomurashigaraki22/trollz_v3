import OrdersList from "../../components/account/OrdersList";
import { getCurrentUser } from "@/lib/session";
import { getOrdersForUser } from "@/lib/queries/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  const orders = await getOrdersForUser(user.id);

  return <OrdersList orders={orders} />;
}
