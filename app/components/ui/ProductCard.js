"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Check } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { formatNaira } from "@/lib/mock/data";
import { useCart } from "../cart/CartProvider";
import { useWishlist } from "../wishlist/WishlistProvider";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [added, setAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const image = product.images?.[0];
  const showOriginalPrice = product.originalPrice > product.price;

  function handleAddToCart() {
    if (product.qty <= 0) return;
    addItem({
      productId: product.id,
      qty: 1,
      size: product.sizeOptions?.[0],
      color: product.colorOptions?.[0],
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleToggleWishlist(event) {
    event.preventDefault();
    event.stopPropagation();
    toggle(product.id);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-shadow duration-200 hover:shadow-lg">
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-square overflow-hidden"
      >
        {image ? (
          <Image
            src={image}
            alt={product.item}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImage className="h-full w-full transition-transform duration-300 group-hover:scale-105" />
        )}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-brand-500 px-2.5 py-1 text-xs font-semibold text-white">
            -{product.discount}%
          </span>
        )}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:text-brand-500 ${
            wishlisted ? "text-brand-500" : "text-ink-600"
          }`}
        >
          <Heart className="h-4 w-4" fill={wishlisted ? "currentColor" : "none"} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">
          {product.category}
        </span>
        <Link
          href={`/product/${product.id}`}
          className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-600"
        >
          {product.item}
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            <span className="text-base font-bold text-ink-900">
              {formatNaira(product.price)}
            </span>
            {showOriginalPrice && (
              <span className="text-xs text-ink-400 line-through">
                {formatNaira(product.originalPrice)}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={product.qty <= 0}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white transition-colors hover:bg-brand-500 disabled:opacity-40"
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
