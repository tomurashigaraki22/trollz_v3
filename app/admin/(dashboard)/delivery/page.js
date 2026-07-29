import AdminDeliveryManager from "../../../components/admin/AdminDeliveryManager";
import { getDeliveryZones } from "@/lib/queries/delivery";

export const dynamic = "force-dynamic";

export default async function AdminDeliveryPage() {
  const zones = await getDeliveryZones();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Delivery Pricing</h1>
        <p className="mt-1 text-sm text-ink-500">
          Manage checkout delivery zones, seller pickup caveats, express pricing, and batch discounts.
        </p>
      </div>
      <AdminDeliveryManager zones={zones} />
    </div>
  );
}
