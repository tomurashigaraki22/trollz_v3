"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import ProductCard from "../ui/ProductCard";

// Parent passes `key={initialQuery}` so this remounts (resetting local
// state from the new prop) whenever the URL's query changes, instead of
// syncing props into state via an effect.
export default function SearchPageClient({ initialQuery = "", results = [] }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef(null);

  function handleChange(event) {
    const value = event.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      router.push(trimmed ? `${pathname}?hsearch=${encodeURIComponent(trimmed)}` : pathname);
    }, 400);
  }

  return (
    <div>
      <div className="mx-auto flex max-w-xl items-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-3 shadow-sm">
        <Search className="h-5 w-5 shrink-0 text-ink-400" />
        <input
          type="search"
          autoFocus
          value={query}
          onChange={handleChange}
          placeholder="Search for products, categories..."
          className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
        />
      </div>

      <div className="mt-10">
        {query.trim() === "" ? (
          <p className="text-center text-sm text-ink-500">
            Start typing to search the catalog.
          </p>
        ) : results.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-ink-500">
              {results.length} result{results.length === 1 ? "" : "s"} for
              <span className="font-medium text-ink-800"> &ldquo;{query}&rdquo;</span>
            </p>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-ink-500">
            No products found for <span className="font-medium">&ldquo;{query}&rdquo;</span>.
          </p>
        )}
      </div>
    </div>
  );
}
