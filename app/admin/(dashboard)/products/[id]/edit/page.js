import Link from "next/link";
import EditProductClient from "../../../../../components/admin/EditProductClient";
import { getProductById } from "@/lib/queries/products";
import { getAllCategoriesForAdmin } from "@/lib/queries/admin-products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getAllCategoriesForAdmin(),
  ]);

  if (!product) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-ink-900">Product not found</h1>
        <p className="text-sm text-ink-500">
          This product may have been deleted. Go back to the{" "}
          <Link href="/admin/products" className="font-medium text-brand-600 hover:underline">
            products list
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink-900">Edit Product</h1>
      <div className="max-w-2xl rounded-2xl border border-ink-100 bg-white p-6">
        <EditProductClient product={product} categories={categories} />
      </div>
    </div>
  );
}
