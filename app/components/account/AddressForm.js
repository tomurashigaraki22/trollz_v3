"use client";

import { useState } from "react";
import Button from "../ui/Button";

const emptyForm = {
  fullName: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nigeria",
  isDefault: false,
};

export default function AddressForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ?? emptyForm);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="text-sm font-medium text-ink-800">Full Name</label>
        <input
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink-800">Phone Number</label>
        <input
          name="phone"
          required
          value={form.phone}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-sm font-medium text-ink-800">Address Line 1</label>
        <input
          name="address1"
          required
          value={form.address1}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="text-sm font-medium text-ink-800">Address Line 2 (optional)</label>
        <input
          name="address2"
          value={form.address2}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink-800">City</label>
        <input
          name="city"
          required
          value={form.city}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink-800">State</label>
        <input
          name="state"
          required
          value={form.state}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink-800">Postal Code</label>
        <input
          name="postalCode"
          value={form.postalCode}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink-800">Country</label>
        <input
          name="country"
          required
          value={form.country}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-700 sm:col-span-2">
        <input
          type="checkbox"
          name="isDefault"
          checked={form.isDefault}
          onChange={handleChange}
          className="h-4 w-4 rounded border-ink-300 accent-brand-500"
        />
        Set as default address
      </label>

      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit">Save Address</Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
