"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, Search } from "lucide-react";
import { formatNaira } from "@/lib/mock/data";
import {
  setProductFlashSaleAction,
  searchProductsForFlashSaleAction,
} from "@/app/actions/admin";

function defaultFlashSaleEnd() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
}

function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function AdminFlashSalesManager({ flashSaleProducts }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleSearch(event) {
    const value = event.target.value;
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const found = await searchProductsForFlashSaleAction(value);
    setResults(found.filter((product) => !product.is_flash_sale));
    setSearching(false);
  }

  function handleAdd(productId) {
    startTransition(async () => {
      await setProductFlashSaleAction(productId, {
        isFlashSale: true,
        discount: 15,
        flashSaleEnd: defaultFlashSaleEnd(),
      });
      setQuery("");
      setResults([]);
      router.refresh();
    });
  }

  function handleRemove(productId) {
    startTransition(async () => {
      await setProductFlashSaleAction(productId, { isFlashSale: false });
      router.refresh();
    });
  }

  function handleDiscountChange(product, value) {
    startTransition(async () => {
      await setProductFlashSaleAction(product.id, {
        isFlashSale: true,
        discount: Number(value) || 0,
        flashSaleEnd: product.flash_sale_end,
      });
      router.refresh();
    });
  }

  function handleEndChange(product, value) {
    startTransition(async () => {
      await setProductFlashSaleAction(product.id, {
        isFlashSale: true,
        discount: product.discount,
        flashSaleEnd: value ? new Date(value).toISOString() : null,
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white">
          <Zap className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink-900">Flash Sales</h1>
          <p className="text-sm text-ink-500">
            {flashSaleProducts.length} product{flashSaleProducts.length === 1 ? "" : "s"}{" "}
            currently in a flash sale.
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink-900">Add a product</h2>
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={handleSearch}
            placeholder="Search products by name..."
            className="w-full rounded-lg border border-ink-200 py-2 pr-3 pl-9 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        {searching && <p className="mt-2 text-xs text-ink-400">Searching...</p>}
        {results.length > 0 && (
          <div className="mt-3 max-w-md space-y-2 rounded-xl border border-ink-100 bg-white p-3">
            {results.map((product) => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-ink-900">{product.item}</p>
                  <p className="text-xs text-ink-500">{formatNaira(product.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(product.id)}
                  className="rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Discount (%)</th>
              <th className="px-4 py-3">Ends At</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {flashSaleProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{product.item}</td>
                <td className="px-4 py-3 text-ink-500">{formatNaira(product.price)}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    max="90"
                    defaultValue={product.discount ?? 0}
                    onBlur={(event) => handleDiscountChange(product, event.target.value)}
                    className="w-20 rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="datetime-local"
                    defaultValue={toDatetimeLocal(product.flash_sale_end)}
                    onBlur={(event) => handleEndChange(product, event.target.value)}
                    className="rounded-lg border border-ink-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    className="rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 hover:bg-ink-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {flashSaleProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-500">
                  No products in a flash sale yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
