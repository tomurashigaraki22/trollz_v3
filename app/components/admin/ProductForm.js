"use client";

import { useState } from "react";
import Button from "../ui/Button";

const emptyForm = {
  item: "",
  category: "",
  subcategory: "",
  price: "",
  discount: "0",
  qty: "0",
  description: "",
  sizeOptions: "Standard",
  colorOptions: "Default",
};

function toFormValues(product) {
  if (!product) return emptyForm;
  return {
    item: product.item ?? "",
    category: product.category ?? "",
    subcategory: product.subcategory ?? "",
    price: String(product.originalPrice ?? product.old_price ?? product.price ?? ""),
    discount: String(product.discount ?? 0),
    qty: String(product.qty ?? 0),
    description: product.description ?? "",
    sizeOptions: (product.sizeOptions ?? ["Standard"]).join(", "),
    colorOptions: (product.colorOptions ?? ["Default"]).join(", "),
  };
}

export default function ProductForm({ product, categories, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => toFormValues(product));

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      item: form.item,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price) || 0,
      discount: Number(form.discount) || 0,
      qty: Number(form.qty) || 0,
      description: form.description,
      sizeOptions: form.sizeOptions
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      colorOptions: form.colorOptions
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };

    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="text-sm font-medium text-ink-800">Product Name</label>
        <input
          name="item"
          required
          value={form.item}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-800">Category</label>
        <select
          name="category"
          required
          value={form.category}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="" disabled>
            Select category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-ink-800">Subcategory</label>
        <input
          name="subcategory"
          value={form.subcategory}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-800">Price (₦)</label>
        <input
          name="price"
          type="number"
          min="0"
          required
          value={form.price}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-800">Discount (%)</label>
        <input
          name="discount"
          type="number"
          min="0"
          max="100"
          value={form.discount}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-800">Stock Quantity</label>
        <input
          name="qty"
          type="number"
          min="0"
          value={form.qty}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink-800">Sizes (comma-separated)</label>
        <input
          name="sizeOptions"
          value={form.sizeOptions}
          onChange={handleChange}
          placeholder="Standard"
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="text-sm font-medium text-ink-800">Colors (comma-separated)</label>
        <input
          name="colorOptions"
          value={form.colorOptions}
          onChange={handleChange}
          placeholder="Default"
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="text-sm font-medium text-ink-800">Description</label>
        <textarea
          name="description"
          rows={4}
          value={form.description}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-2">
        <Button type="submit">{submitLabel ?? (product ? "Save Changes" : "Add Product")}</Button>
      </div>
    </form>
  );
}
