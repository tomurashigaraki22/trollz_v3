"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { slugify } from "@/lib/slugify";
import { addCategoryAction, deleteCategoryAction } from "@/app/actions/admin";

export default function AdminCategoriesManager({ categories }) {
  const [name, setName] = useState("");
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await addCategoryAction({ name: name.trim() });
      setName("");
      router.refresh();
    });
  }

  function handleDelete(category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    startTransition(async () => {
      await deleteCategoryAction(category.id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New category name"
          className="min-w-64 flex-1 rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <Button type="submit">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{category.name}</td>
                <td className="px-4 py-3 text-ink-500">{slugify(category.name)}</td>
                <td className="px-4 py-3 text-ink-500">{category.productCount ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
                      aria-label="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-ink-500">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
