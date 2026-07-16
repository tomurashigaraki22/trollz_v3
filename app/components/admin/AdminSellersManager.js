"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Dices } from "lucide-react";
import Button from "../ui/Button";
import {
  createSellerAction,
  setSellerStatusAction,
  deleteSellerAction,
} from "@/app/actions/admin";

const emptyForm = { storeName: "", email: "", phone: "", password: "" };

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function AdminSellersManager({ sellers }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createSellerAction(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm(emptyForm);
      setAdding(false);
      router.refresh();
    });
  }

  function handleToggleStatus(seller) {
    startTransition(async () => {
      await setSellerStatusAction(seller.id, seller.status ? 0 : 1);
      router.refresh();
    });
  }

  function handleDelete(seller) {
    if (!window.confirm(`Delete seller "${seller.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteSellerAction(seller.id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Sellers</h1>
          <p className="mt-1 text-sm text-ink-500">{sellers.length} seller accounts.</p>
        </div>
        <Button type="button" size="sm" onClick={() => setAdding((value) => !value)}>
          <Plus className="h-4 w-4" /> Add Seller
        </Button>
      </div>

      {adding && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 rounded-2xl border border-ink-100 bg-white p-6 sm:grid-cols-2"
        >
          <div>
            <label className="text-sm font-medium text-ink-800">Store Name</label>
            <input
              name="storeName"
              required
              value={form.storeName}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Email</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Phone</label>
            <input
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Password</label>
            <div className="mt-2 flex gap-2">
              <input
                name="password"
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, password: generatePassword() }))}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-sm text-ink-600 hover:bg-ink-50"
              >
                <Dices className="h-4 w-4" /> Generate
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}

          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit">Create Seller</Button>
            <Button type="button" variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {sellers.map((seller) => (
              <tr key={seller.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{seller.name}</td>
                <td className="px-4 py-3 text-ink-600">{seller.email}</td>
                <td className="px-4 py-3 text-ink-500">{seller.phone}</td>
                <td className="px-4 py-3 text-ink-500">{seller.product_count}</td>
                <td className="px-4 py-3 text-ink-500">{seller.order_count}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(seller)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      seller.status
                        ? "border-success/30 bg-success/15 text-success"
                        : "border-ink-200 bg-ink-50 text-ink-500"
                    }`}
                  >
                    {seller.status ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(seller)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10 ml-auto"
                    aria-label="Delete seller"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {sellers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-500">
                  No sellers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
