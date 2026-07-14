"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { formatNaira } from "@/lib/mock/data";
import { deleteProductAction } from "@/app/actions/admin";

export default function AdminProductsTable({ products }) {
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = products.filter((product) =>
    product.item.toLowerCase().includes(query.trim().toLowerCase())
  );

  function handleDelete(product) {
    if (!window.confirm(`Delete "${product.item}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProductAction(product.id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search products..."
        className="w-full max-w-sm rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{product.item}</td>
                <td className="px-4 py-3 text-ink-500">{product.category}</td>
                <td className="px-4 py-3 text-ink-800">{formatNaira(product.price)}</td>
                <td className="px-4 py-3 text-ink-500">
                  {product.discount > 0 ? `${product.discount}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  {product.qty > 0 ? (
                    <span className="text-ink-800">{product.qty}</span>
                  ) : (
                    <span className="text-danger">Out of stock</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100"
                      aria-label="Edit product"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
                      aria-label="Delete product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
