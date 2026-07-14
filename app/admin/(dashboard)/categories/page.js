import AdminCategoriesManager from "../../../components/admin/AdminCategoriesManager";
import { getAllCategoriesForAdmin } from "@/lib/queries/admin-products";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink-900">Categories</h1>
      <AdminCategoriesManager categories={categories} />
    </div>
  );
}
