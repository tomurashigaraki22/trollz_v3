"use client";

// Hybrid cart: guests use localStorage (the real `cart` table requires a
// logged-in `userid`, so there's nowhere real to put a guest cart). Once
// signed in, the cart lives in the real `cart` table and any leftover guest
// items are merged in and the local copy is cleared. Product details
// (price, name, images) are resolved from the real database via
// /api/products, since the browser can't query MySQL directly.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import {
  getCartAction,
  addToCartAction,
  updateCartQtyAction,
  removeFromCartAction,
  clearCartAction,
  mergeGuestCartAction,
} from "@/app/actions/cart";

const CART_KEY = "trollz_mock_cart";
const SHIPPING_FEE = 2500;
const FREE_SHIPPING_THRESHOLD = 50000;

const CartContext = createContext(null);

function readGuestCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function makeLineId(productId, size, color) {
  return `${productId}::${size ?? ""}::${color ?? ""}`;
}

export function CartProvider({ children }) {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";

  const [items, setItems] = useState([]);
  const [productsById, setProductsById] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const mergingRef = useRef(false);

  const refreshServerCart = useCallback(async () => {
    const serverItems = await getCartAction();
    setItems(serverItems ?? []);
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    async function init() {
      if (isAuthenticated) {
        const guestItems = readGuestCart();
        if (guestItems.length > 0 && !mergingRef.current) {
          mergingRef.current = true;
          await mergeGuestCartAction(guestItems);
          writeGuestCart([]);
        }
        await refreshServerCart();
      } else {
        setItems(readGuestCart());
      }
      setHydrated(true);
    }
    init();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isAuthenticated, refreshServerCart]);

  const uniqueProductIds = useMemo(
    () => [...new Set(items.map((item) => item.productId))],
    [items]
  );

  useEffect(() => {
    // Syncs local state with the real product data from /api/products (an
    // external system) whenever the cart's product ids change.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (uniqueProductIds.length === 0) {
      setProductsById({});
      return;
    }
    let cancelled = false;
    fetch(`/api/products?ids=${uniqueProductIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const map = {};
        for (const product of data.products ?? []) {
          map[product.id] = product;
        }
        setProductsById(map);
      })
      .catch(() => {
        if (!cancelled) setProductsById({});
      });
    return () => {
      cancelled = true;
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [uniqueProductIds]);

  const addItem = useCallback(
    async ({ productId, qty = 1, size, color }) => {
      if (isAuthenticated) {
        await addToCartAction({ productId, qty, size, color });
        await refreshServerCart();
        return;
      }
      const lineId = makeLineId(productId, size, color);
      const existing = readGuestCart();
      const match = existing.find((item) => item.lineId === lineId);
      const nextItems = match
        ? existing.map((item) => (item.lineId === lineId ? { ...item, qty: item.qty + qty } : item))
        : [...existing, { lineId, productId, qty, size, color }];
      writeGuestCart(nextItems);
      setItems(nextItems);
    },
    [isAuthenticated, refreshServerCart]
  );

  const updateQty = useCallback(
    async (lineId, qty) => {
      const safeQty = Math.max(1, qty);
      if (isAuthenticated) {
        const item = items.find((entry) => entry.lineId === lineId);
        if (!item) return;
        await updateCartQtyAction(item.dbId, safeQty);
        await refreshServerCart();
        return;
      }
      const nextItems = items.map((item) =>
        item.lineId === lineId ? { ...item, qty: safeQty } : item
      );
      writeGuestCart(nextItems);
      setItems(nextItems);
    },
    [isAuthenticated, items, refreshServerCart]
  );

  const removeItem = useCallback(
    async (lineId) => {
      if (isAuthenticated) {
        const item = items.find((entry) => entry.lineId === lineId);
        if (!item) return;
        await removeFromCartAction(item.dbId);
        await refreshServerCart();
        return;
      }
      const nextItems = items.filter((item) => item.lineId !== lineId);
      writeGuestCart(nextItems);
      setItems(nextItems);
    },
    [isAuthenticated, items, refreshServerCart]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      await clearCartAction();
      setItems([]);
      return;
    }
    writeGuestCart([]);
    setItems([]);
  }, [isAuthenticated]);

  const lines = useMemo(
    () =>
      items
        .map((item) => {
          const product = productsById[item.productId];
          if (!product) return null;
          return {
            ...item,
            product,
            unitPrice: product.price,
            lineTotal: product.price * item.qty,
          };
        })
        .filter(Boolean),
    [items, productsById]
  );

  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + line.lineTotal, 0), [lines]);
  const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const value = useMemo(
    () => ({
      hydrated,
      lines,
      itemCount,
      subtotal,
      shippingFee,
      total,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      addItem,
      updateQty,
      removeItem,
      clearCart,
    }),
    [hydrated, lines, itemCount, subtotal, shippingFee, total, addItem, updateQty, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
