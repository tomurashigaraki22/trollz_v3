"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const COMPARE_KEY = "trollz_compare";
const MAX_COMPARE = 4;

const CompareContext = createContext(null);

function readCompare() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMPARE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCompare(ids) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
}

export function CompareProvider({ children }) {
  const [productIds, setProductIds] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setProductIds(readCompare());
  }, []);

  useEffect(() => {
    if (productIds.length === 0) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
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
  }, [productIds]);

  const persist = useCallback((nextIds) => {
    setProductIds(nextIds);
    writeCompare(nextIds);
  }, []);

  const toggle = useCallback(
    (productId) => {
      const current = readCompare();
      const next = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [productId, ...current].slice(0, MAX_COMPARE);
      persist(next);
    },
    [persist]
  );

  const clear = useCallback(() => persist([]), [persist]);
  const isCompared = useCallback((productId) => productIds.includes(productId), [productIds]);

  const value = useMemo(
    () => ({ productIds, products, count: productIds.length, toggle, clear, isCompared }),
    [productIds, products, toggle, clear, isCompared]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare must be used within CompareProvider");
  return context;
}
