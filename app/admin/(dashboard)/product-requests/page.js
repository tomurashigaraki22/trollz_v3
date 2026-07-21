import ProductRequestsManager from "../../../components/admin/ProductRequestsManager";
import { getProductRequests } from "@/lib/queries/productRequests";

export const dynamic = "force-dynamic";

export default async function AdminProductRequestsPage() {
  const requests = await getProductRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Product Requests</h1>
        <p className="mt-1 text-sm text-ink-500">
          Review customer requests and source items through the seller network.
        </p>
      </div>
      <ProductRequestsManager requests={requests} />
    </div>
  );
}
