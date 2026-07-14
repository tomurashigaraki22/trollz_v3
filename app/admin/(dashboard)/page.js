import Link from "next/link";
import { ShoppingBag, Package, Users, Headset, ArrowRight } from "lucide-react";
import { formatNaira } from "@/lib/mock/data";
import { ORDER_STATUS_STYLES } from "@/lib/orderStatus";
import { getCurrentUser } from "@/lib/session";
import { getAllOrders } from "@/lib/queries/orders";
import { getAllProductsForAdmin } from "@/lib/queries/admin-products";
import { getAllCustomers } from "@/lib/queries/users";
import { getAllSupportMessages } from "@/lib/queries/support";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [admin, orders, products, customers, supportMessages] = await Promise.all([
    getCurrentUser(),
    getAllOrders(),
    getAllProductsForAdmin(),
    getAllCustomers(),
    getAllSupportMessages(),
  ]);

  const revenue = orders
    .filter((order) => order.order_status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total_amount), 0);
  const openTickets = supportMessages.filter((message) => message.status === "open").length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Revenue", value: formatNaira(revenue), icon: ShoppingBag, href: "/admin/orders" },
    { label: "Products", value: products.length, icon: Package, href: "/admin/products" },
    { label: "Customers", value: customers.length, icon: Users, href: "/admin/users" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Welcome back, {admin.name}</h1>
        <p className="mt-1 text-sm text-ink-500">Here&apos;s what&apos;s happening in your store.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-ink-100 bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <stat.icon className="h-5 w-5 text-brand-500" />
            <p className="mt-3 text-2xl font-bold text-ink-900">{stat.value}</p>
            <p className="text-sm text-ink-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {openTickets > 0 && (
        <Link
          href="/admin/support"
          className="flex items-center justify-between rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-ink-800"
        >
          <span className="flex items-center gap-2">
            <Headset className="h-4 w-4 text-warning" />
            {openTickets} open support ticket{openTickets === 1 ? "" : "s"} need attention.
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{order.tracking}</td>
                  <td className="px-4 py-3 text-ink-600">{order.customer_name}</td>
                  <td className="px-4 py-3 text-ink-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {formatNaira(order.total_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${ORDER_STATUS_STYLES[order.order_status]}`}
                    >
                      {order.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
