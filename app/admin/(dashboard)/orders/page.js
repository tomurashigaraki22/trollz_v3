import AdminOrdersTable from "../../../components/admin/AdminOrdersTable";
import { getAllOrders } from "@/lib/queries/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink-900">Orders</h1>
      <AdminOrdersTable orders={orders} />
    </div>
  );
}
