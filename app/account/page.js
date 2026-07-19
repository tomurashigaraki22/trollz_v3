import Link from "next/link";
import { PackageSearch, MapPin, CreditCard, ArrowRight } from "lucide-react";
import Card from "../components/ui/Card";
import { formatNaira } from "@/lib/mock/data";
import { ORDER_STATUS_STYLES } from "@/lib/orderStatus";
import { requireUser } from "@/lib/session";
import { getOrdersForUser } from "@/lib/queries/orders";
import { getAddressesForUser } from "@/lib/queries/addresses";
import { getPaymentMethodsForUser } from "@/lib/queries/paymentMethods";

export const dynamic = "force-dynamic";

export default async function AccountOverviewPage() {
  const user = await requireUser();
  const [orders, addresses, paymentMethods] = await Promise.all([
    getOrdersForUser(user.id),
    getAddressesForUser(user.id),
    getPaymentMethodsForUser(user.id),
  ]);

  const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0];
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Welcome back, {user.name}</h2>
        <p className="mt-1 text-sm text-ink-500">
          Here&apos;s a quick look at your account activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <PackageSearch className="h-5 w-5 text-brand-500" />
          <p className="mt-3 text-2xl font-bold text-ink-900">{orders.length}</p>
          <p className="text-sm text-ink-500">Total orders</p>
        </Card>
        <Card className="p-5">
          <MapPin className="h-5 w-5 text-brand-500" />
          <p className="mt-3 text-sm font-semibold text-ink-900">
            {defaultAddress ? defaultAddress.city : "No address yet"}
          </p>
          <p className="text-sm text-ink-500">Default shipping address</p>
        </Card>
        <Card className="p-5">
          <CreditCard className="h-5 w-5 text-brand-500" />
          <p className="mt-3 text-sm font-semibold text-ink-900">
            {paymentMethods.length > 0
              ? `${paymentMethods.length} saved method${paymentMethods.length === 1 ? "" : "s"}`
              : "No cards saved"}
          </p>
          <p className="text-sm text-ink-500">Payment methods</p>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink-900">Recent Orders</h3>
          <Link
            href="/account/orders"
            className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-ink-500">You haven&apos;t placed any orders yet.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Card key={order.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-ink-900">Order #{order.tracking}</p>
                  <p className="text-xs text-ink-500">
                    {new Date(order.created_at).toLocaleDateString()} · {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-ink-900">
                    {formatNaira(order.total_amount)}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${ORDER_STATUS_STYLES[order.order_status]}`}
                  >
                    {order.order_status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
