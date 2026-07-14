"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { slugify } from "@/lib/slugify";

const PRICE_CAP = 600000;

function buildHref(pathname, params, updates) {
  const next = new URLSearchParams(params.toString());
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  });
  next.delete("page");
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export default function ShopFilters({ categories, selectedCategory, maxPrice }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-ink-900">Category</h3>
        <div className="mt-3 space-y-2">
          <Link
            href={buildHref(pathname, searchParams, { category: null })}
            className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              !selectedCategory
                ? "bg-brand-50 font-medium text-brand-600"
                : "text-ink-600 hover:bg-ink-50"
            }`}
          >
            All Products
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={buildHref(pathname, searchParams, { category: slugify(category.name) })}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedCategory === category.name
                  ? "bg-brand-50 font-medium text-brand-600"
                  : "text-ink-600 hover:bg-ink-50"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink-900">Max Price</h3>
        <form method="get" className="mt-3">
          {Array.from(searchParams.entries())
            .filter(([key]) => key !== "maxPrice" && key !== "page")
            .map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
          <input
            type="range"
            name="maxPrice"
            min={5000}
            max={PRICE_CAP}
            step={5000}
            defaultValue={maxPrice ?? PRICE_CAP}
            className="w-full accent-brand-500"
            onChange={(event) => event.target.form?.requestSubmit()}
          />
          <p className="mt-2 text-sm text-ink-500">
            Up to{" "}
            <span className="font-medium text-ink-800">
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                maximumFractionDigits: 0,
              }).format(maxPrice ?? PRICE_CAP)}
            </span>
          </p>
        </form>
      </div>
    </aside>
  );
}
