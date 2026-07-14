import Button from "../../../components/ui/Button";
import AdminProductsTable from "../../../components/admin/AdminProductsTable";
import { Plus } from "lucide-react";
import { getAllProductsForAdmin } from "@/lib/queries/admin-products";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">Products</h1>
        <Button href="/admin/products/new" size="sm">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>
      <AdminProductsTable products={products} />
    </div>
  );
}
