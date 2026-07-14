import NewProductClient from "../../../../components/admin/NewProductClient";
import { getAllCategoriesForAdmin } from "@/lib/queries/admin-products";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink-900">Add Product</h1>
      <div className="max-w-2xl rounded-2xl border border-ink-100 bg-white p-6">
        <NewProductClient categories={categories} />
      </div>
    </div>
  );
}
