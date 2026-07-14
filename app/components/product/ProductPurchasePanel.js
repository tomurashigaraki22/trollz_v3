"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Heart, Check } from "lucide-react";
import Button from "../ui/Button";
import { useCart } from "../cart/CartProvider";
import { useWishlist } from "../wishlist/WishlistProvider";

export default function ProductPurchasePanel({ product }) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const inStock = product.qty > 0;
  const hasSizes = product.sizeOptions?.length > 1;
  const hasColors = product.colorOptions?.length > 1;

  function handleAddToCart() {
    if (hasSizes && !size) {
      setError("Please select a size.");
      return;
    }
    if (hasColors && !color) {
      setError("Please select a color.");
      return;
    }
    setError("");
    addItem({
      productId: product.id,
      qty,
      size: size || product.sizeOptions?.[0],
      color: color || product.colorOptions?.[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-5">
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
            {product.sizeOptions.map((option) => (
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
            {product.colorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}

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

      <div className="flex items-stretch gap-3 pt-2">
        <Button
          type="button"
          size="lg"
          disabled={!inStock}
          onClick={handleAddToCart}
          className="min-w-0 flex-1"
        >
          {added ? <Check className="h-4 w-4 shrink-0" /> : <ShoppingCart className="h-4 w-4 shrink-0" />}
          <span className="truncate">
            {!inStock ? "Out of Stock" : added ? "Added to Cart" : "Add to Cart"}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggle(product.id)}
          className={`w-13 shrink-0 px-0 ${wishlisted ? "border-brand-500 text-brand-500" : ""}`}
        >
          <Heart className="h-4 w-4" fill={wishlisted ? "currentColor" : "none"} />
        </Button>
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
