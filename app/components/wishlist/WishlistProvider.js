"use client";

// Wishlist layer: the list of saved product ids persists to localStorage
// independent of login (works for guests too — the legacy site's heart icon
// was a dead link, this is genuinely new functionality). Full product
// details are resolved from the real database via /api/products, since the
// browser can't query MySQL directly.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const WISHLIST_KEY = "trollz_mock_wishlist";

const WishlistContext = createContext(null);

function readWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
}

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState([]);
  const [products, setProducts] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setProductIds(readWishlist());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    // Syncs local state with the real product data from /api/products (an
    // external system) whenever the wishlist's product ids change.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/products?ids=${productIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setProducts(data.products ?? []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [productIds]);

  const persist = useCallback((nextIds) => {
    setProductIds(nextIds);
    writeWishlist(nextIds);
  }, []);

  const toggle = useCallback(
    (productId) => {
      const current = readWishlist();
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      persist(next);
    },
    [persist]
  );

  const remove = useCallback(
    (productId) => {
      persist(productIds.filter((id) => id !== productId));
    },
    [productIds, persist]
  );

  const isWishlisted = useCallback((productId) => productIds.includes(productId), [productIds]);

  const value = useMemo(
    () => ({
      hydrated,
      productIds,
      products,
      count: productIds.length,
      toggle,
      remove,
      isWishlisted,
    }),
    [hydrated, productIds, products, toggle, remove, isWishlisted]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
