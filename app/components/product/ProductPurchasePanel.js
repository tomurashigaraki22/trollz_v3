"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Heart, Check, GitCompare } from "lucide-react";
import Button from "../ui/Button";
import { useCart } from "../cart/CartProvider";
import { useWishlist } from "../wishlist/WishlistProvider";
import { useCompare } from "../compare/CompareProvider";
import { getCategoryFields } from "@/lib/categoryFields";

const ATTRIBUTE_LABELS = {
  brand: "Brand",
  gender: "Gender",
  storage: "Storage",
  ram: "RAM",
  condition: "Condition",
  skinType: "Skin Type",
  material: "Material",
  warranty: "Warranty",
  model: "Model",
  processor: "Processor",
  screenSize: "Screen Size",
  expiryDate: "Expiry Date",
  weightVolume: "Weight / Volume",
  volume: "Volume",
  dimensions: "Dimensions",
};

const SELECTABLE_ATTRIBUTE_KEYS = new Set(["gender", "storage", "ram", "condition", "skinType"]);

function displayValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value ?? "").trim();
}

export default function ProductPurchasePanel({ product }) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { toggle: toggleCompare, isCompared } = useCompare();
  const wishlisted = isWishlisted(product.id);
  const compared = isCompared(product.id);
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const inStock = product.qty > 0;
  const sizeOptions = (product.sizeOptions ?? []).filter((option) => option && option !== "Standard");
  const colorOptions = (product.colorOptions ?? []).filter((option) => option && option !== "Default");
  const hasSizes = sizeOptions.length > 0;
  const hasColors = colorOptions.length > 0;
  const categorySelectableFields = getCategoryFields(product.category)
    .filter((field) => field.type === "select" || field.type === "multiselect")
    .filter((field) => !["sizes", "colors"].includes(field.key));
  const configuredSelectableAttributes = categorySelectableFields
    .map((field) => {
      const rawValue = product.attributes?.[field.key];
      const options = Array.isArray(rawValue)
        ? rawValue.filter(Boolean).map(String)
        : rawValue == null || String(rawValue).trim() === ""
          ? []
          : [String(rawValue).trim()];
      return { key: field.key, label: field.label, options };
    })
    .filter(({ options }) => options.length > 0);
  const configuredKeys = new Set(configuredSelectableAttributes.map(({ key }) => key));
  const additionalSelectableAttributes = Object.entries(product.attributes ?? {})
    .filter(([key, value]) => {
      if (configuredKeys.has(key) || ["sizes", "colors"].includes(key)) return false;
      return SELECTABLE_ATTRIBUTE_KEYS.has(key) || (Array.isArray(value) && value.length > 1);
    })
    .map(([key, value]) => ({
      key,
      label: ATTRIBUTE_LABELS[key] ?? key.replace(/_/g, " "),
      options: Array.isArray(value) ? value.filter(Boolean).map(String) : [String(value).trim()],
    }))
    .filter(({ options }) => options.length > 0);
  const selectableAttributes = [...configuredSelectableAttributes, ...additionalSelectableAttributes];
  const selectableKeys = new Set(selectableAttributes.map(({ key }) => key));
  const specs = Object.entries(product.attributes ?? {})
    .filter(([key]) => !selectableKeys.has(key))
    .map(([key, value]) => [ATTRIBUTE_LABELS[key] ?? key.replace(/_/g, " "), displayValue(value)])
    .filter(([, value]) => value);

  function handleAddToCart() {
    if (hasSizes && !size) {
      setError("Please select a size.");
      return;
    }
    if (hasColors && !color) {
      setError("Please select a color.");
      return;
    }
    const selectedOptions = Object.fromEntries(
      selectableAttributes.map(({ key, options }) => [key, selectedAttributes[key] || options[0]])
    );
    const missingAttribute = selectableAttributes.find(
      ({ key, options }) => options.length > 1 && !selectedAttributes[key]
    );
    if (missingAttribute) {
      setError(`Please select ${missingAttribute.label.toLowerCase()}.`);
      return;
    }
    setError("");
    addItem({
      productId: product.id,
      qty,
      size: size || sizeOptions[0] || product.sizeOptions?.[0],
      color: color || colorOptions[0] || product.colorOptions?.[0],
      options: selectedOptions,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-5">
      {specs.length > 0 && (
        <div className="rounded-xl border border-ink-100 bg-ink-50 p-4">
          <h2 className="text-sm font-semibold text-ink-900">Product details</h2>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase text-ink-400">{label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {hasSizes && (
        <div>
          <label htmlFor="size" className="text-sm font-medium text-ink-800">
            Size
          </label>
          <select
            id="size"
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="" disabled>
              Select size
            </option>
            {sizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {hasColors && (
        <div>
          <label htmlFor="color" className="text-sm font-medium text-ink-800">
            Color
          </label>
          <select
            id="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="" disabled>
              Select color
            </option>
            {colorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectableAttributes.map(({ key, label, options }) => (
        <div key={key}>
          <label htmlFor={`attribute-${key}`} className="text-sm font-medium text-ink-800">
            {label}
          </label>
          <select
            id={`attribute-${key}`}
            value={selectedAttributes[key] ?? (options.length === 1 ? options[0] : "")}
            onChange={(event) => {
              setSelectedAttributes((current) => ({ ...current, [key]: event.target.value }));
              setError("");
            }}
            className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            {options.length > 1 && (
              <option value="" disabled>
                Select {label.toLowerCase()}
              </option>
            )}
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div>
        <span className="text-sm font-medium text-ink-800">Quantity</span>
        <div className="mt-2 inline-flex items-center rounded-lg border border-ink-200">
          <button
            type="button"
            onClick={() => setQty((value) => Math.max(1, value - 1))}
            className="flex h-11 w-11 items-center justify-center text-ink-600 hover:text-brand-600"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((value) => Math.min(product.qty, value + 1))}
            className="flex h-11 w-11 items-center justify-center text-ink-600 hover:text-brand-600"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="space-y-3 pt-2">
        <Button
          type="button"
          size="lg"
          disabled={!inStock}
          onClick={handleAddToCart}
          className="w-full"
        >
          {added ? <Check className="h-4 w-4 shrink-0" /> : <ShoppingCart className="h-4 w-4 shrink-0" />}
          <span className="truncate">
            {!inStock ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
          </span>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={wishlisted}
            onClick={() => toggle(product.id)}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 text-sm font-semibold transition-colors ${
              wishlisted
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-ink-200 text-ink-700 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            <Heart className="h-4 w-4 shrink-0" fill={wishlisted ? "currentColor" : "none"} />
            <span className="truncate">{wishlisted ? "Saved" : "Save"}</span>
          </button>
          <button
            type="button"
            aria-pressed={compared}
            onClick={() => toggleCompare(product.id)}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-full border px-3 text-sm font-semibold transition-colors ${
              compared
                ? "border-brand-500 bg-brand-50 text-brand-600"
                : "border-ink-200 text-ink-700 hover:border-brand-500 hover:text-brand-600"
            }`}
          >
            <GitCompare className="h-4 w-4 shrink-0" />
            <span className="truncate">{compared ? "Comparing" : "Compare"}</span>
          </button>
        </div>
      </div>

      {added && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          View cart →
        </button>
      )}
    </div>
  );
}
