"use client";

import { useEffect, useState } from "react";
import ProductCard from "../ui/ProductCard";

const RECENT_KEY = "trollz_recently_viewed";
const MAX_RECENT = 8;

function readRecentIds() {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function ProductViewTracker({ productId }) {
  useEffect(() => {
    const current = readRecentIds();
    const next = [productId, ...current.filter((id) => id !== productId)].slice(0, MAX_RECENT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }, [productId]);

  return null;
}

export default function RecentlyViewedProducts({ currentProductId }) {
  const [products, setProducts] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const ids = readRecentIds().filter((id) => id !== currentProductId).slice(0, 4);
    if (ids.length === 0) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setHydrated(true);
      return;
    }

    let cancelled = false;
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProducts(data.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [currentProductId]);

  if (!hydrated || products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
