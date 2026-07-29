"use client";

import { useMemo, useState } from "react";
import Button from "../ui/Button";
import { getCategoryFields, resolveFieldOptions } from "@/lib/categoryFields";

const emptyForm = {
  item: "",
  category: "",
  subcategory: "",
  price: "",
  discount: "0",
  qty: "0",
  description: "",
};

function parseJsonArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

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
  };
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-800">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ChipToggle({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(active ? value.filter((item) => item !== option) : [...value, option])}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
              active
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-ink-200 text-ink-700 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function DynamicField({ field, subcategory, value, onChange }) {
  const options = resolveFieldOptions(field, subcategory);

  if (field.type === "multiselect") {
    return (
      <Field label={field.label}>
        <ChipToggle options={options} value={value ?? []} onChange={onChange} />
      </Field>
    );
  }

  if (field.type === "select") {
    return (
      <Field label={field.label}>
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  return (
    <Field label={field.label}>
      <input
        type={field.type === "date" ? "date" : "text"}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
      />
    </Field>
  );
}

export default function ProductForm({ product, categories, onSubmit, submitLabel }) {
  const [form, setForm] = useState(() => toFormValues(product));
  const [attributeValues, setAttributeValues] = useState(() => ({
    ...(product?.attributes ?? {}),
    colors: product?.colorOptions ?? parseJsonArray(product?.color_options),
    sizes: product?.sizeOptions ?? parseJsonArray(product?.size_options),
  }));

  const categoryFields = useMemo(
    () => (form.category ? getCategoryFields(form.category) : []),
    [form.category]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "category") {
      setForm((prev) => ({ ...prev, subcategory: "" }));
    }
  }

  function setAttribute(key, value) {
    setAttributeValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const otherAttributes = Object.fromEntries(
      Object.entries(attributeValues).filter(([key]) => key !== "colors" && key !== "sizes")
    );

    onSubmit({
      item: form.item,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price) || 0,
      discount: Number(form.discount) || 0,
      qty: Number(form.qty) || 0,
      description: form.description,
      sizeOptions: attributeValues.sizes ?? [],
      colorOptions: attributeValues.colors ?? [],
      attributes: otherAttributes,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Product Name">
          <input
            name="item"
            required
            value={form.item}
            onChange={handleChange}
            className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </Field>
      </div>

      <Field label="Category">
        <select
          name="category"
          required
          value={form.category}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
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
      </Field>

      <Field label="Subcategory">
        <input
          name="subcategory"
          value={form.subcategory}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </Field>

      <Field label="Price (NGN)">
        <input
          name="price"
          type="number"
          min="0"
          required
          value={form.price}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </Field>

      <Field label="Discount (%)">
        <input
          name="discount"
          type="number"
          min="0"
          max="100"
          value={form.discount}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </Field>

      <Field label="Stock Quantity">
        <input
          name="qty"
          type="number"
          min="0"
          value={form.qty}
          onChange={handleChange}
          className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </Field>

      {categoryFields.length > 0 && (
        <div className="sm:col-span-2">
          <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <h2 className="text-sm font-semibold text-ink-900">Product details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {categoryFields.map((field) => (
                <DynamicField
                  key={field.key}
                  field={field}
                  subcategory={form.subcategory}
                  value={attributeValues[field.key]}
                  onChange={(value) => setAttribute(field.key, value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="sm:col-span-2">
        <Field label="Description">
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <Button type="submit">{submitLabel ?? (product ? "Save Changes" : "Add Product")}</Button>
      </div>
    </form>
  );
}
