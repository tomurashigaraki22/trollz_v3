"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import ShopFilters from "./ShopFilters";
import ProductCard from "../ui/ProductCard";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ShopPageClient({
  products,
  categories,
  selectedCategory,
  maxPrice,
  sort,
  page,
  totalPages,
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null || value === undefined || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete("page");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function goToPage(nextPage) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(nextPage));
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
      <div className="hidden lg:block">
        <ShopFilters categories={categories} selectedCategory={selectedCategory} maxPrice={maxPrice} />
      </div>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          <select
            value={sort}
            onChange={(event) => updateParam("sort", event.target.value)}
            className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 focus:border-brand-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {mobileFiltersOpen && (
          <div className="mb-6 rounded-2xl border border-ink-100 p-4 lg:hidden">
            <ShopFilters categories={categories} selectedCategory={selectedCategory} maxPrice={maxPrice} />
          </div>
        )}

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-600 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-ink-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-600 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink-200 py-16 text-center text-sm text-ink-500">
            No products match these filters. Try widening your search.
          </div>
        )}
      </div>
    </div>
  );
}
