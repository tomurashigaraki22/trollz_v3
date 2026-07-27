"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { formatNaira } from "@/lib/mock/data";
import {
  createCouponAction,
  setCouponActiveAction,
  deleteCouponAction,
} from "@/app/actions/admin";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: "",
  minOrderAmount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
};

function describeDiscount(coupon) {
  return coupon.discount_type === "percent"
    ? `${Number(coupon.discount_value)}% off`
    : `${formatNaira(coupon.discount_value)} off`;
}

export default function AdminCouponsManager({ coupons }) {
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
      const result = await createCouponAction({
        code: form.code,
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm(emptyForm);
      setAdding(false);
      router.refresh();
    });
  }

  function handleToggleActive(coupon) {
    startTransition(async () => {
      await setCouponActiveAction(coupon.id, !coupon.active);
      router.refresh();
    });
  }

  function handleDelete(coupon) {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteCouponAction(coupon.id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Coupons</h1>
          <p className="mt-1 text-sm text-ink-500">{coupons.length} coupon codes.</p>
        </div>
        <Button type="button" size="sm" onClick={() => setAdding((value) => !value)}>
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>

      {adding && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 rounded-2xl border border-ink-100 bg-white p-6 sm:grid-cols-3"
        >
          <div>
            <label className="text-sm font-medium text-ink-800">Code</label>
            <input
              name="code"
              required
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. SAVE20"
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm uppercase focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-ink-800">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Shown to customers at checkout"
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Discount Type</label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount (₦)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">
              Discount Value {form.discountType === "percent" ? "(%)" : "(₦)"}
            </label>
            <input
              name="discountValue"
              type="number"
              min="0"
              required
              value={form.discountValue}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Minimum Order (₦)</label>
            <input
              name="minOrderAmount"
              type="number"
              min="0"
              value={form.minOrderAmount}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Usage Limit</label>
            <input
              name="usageLimit"
              type="number"
              min="0"
              value={form.usageLimit}
              onChange={handleChange}
              placeholder="Unlimited"
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Starts At</label>
            <input
              name="startsAt"
              type="datetime-local"
              value={form.startsAt}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-800">Expires At</label>
            <input
              name="expiresAt"
              type="datetime-local"
              value={form.expiresAt}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-danger sm:col-span-3">{error}</p>}

          <div className="flex gap-3 sm:col-span-3">
            <Button type="submit">Create Coupon</Button>
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
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink-900">{coupon.code}</p>
                  {coupon.description && <p className="text-xs text-ink-400">{coupon.description}</p>}
                </td>
                <td className="px-4 py-3 text-ink-600">{describeDiscount(coupon)}</td>
                <td className="px-4 py-3 text-ink-500">{formatNaira(coupon.min_order_amount)}</td>
                <td className="px-4 py-3 text-ink-500">
                  {coupon.used_count}
                  {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                </td>
                <td className="px-4 py-3 text-ink-500">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "Never"}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(coupon)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      coupon.active
                        ? "border-success/30 bg-success/15 text-success"
                        : "border-ink-200 bg-ink-50 text-ink-500"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(coupon)}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
                    aria-label="Delete coupon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-500">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
