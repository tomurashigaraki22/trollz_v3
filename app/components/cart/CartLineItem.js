"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import PlaceholderImage from "../ui/PlaceholderImage";
import { formatNaira } from "@/lib/mock/data";
import { useCart } from "./CartProvider";

export default function CartLineItem({ line }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="flex gap-4 border-b border-ink-100 py-5 last:border-b-0">
      <Link
        href={`/product/${line.product.id}`}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-xl"
      >
        <PlaceholderImage className="h-full w-full" />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/product/${line.product.id}`}
              className="text-sm font-semibold text-ink-900 hover:text-brand-600"
            >
              {line.product.item}
            </Link>
            <p className="mt-1 text-xs text-ink-500">
              {line.size && line.size !== "Standard" ? `Size: ${line.size}` : ""}
              {line.size && line.size !== "Standard" && line.color && line.color !== "Default"
                ? " · "
                : ""}
              {line.color && line.color !== "Default" ? `Color: ${line.color}` : ""}
            </p>
          </div>
          <button
            type="button"
            aria-label="Remove item"
            onClick={() => removeItem(line.lineId)}
            className="text-ink-400 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-lg border border-ink-200">
            <button
              type="button"
              onClick={() => updateQty(line.lineId, line.qty - 1)}
              className="flex h-8 w-8 items-center justify-center text-ink-600 hover:text-brand-600"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-medium">{line.qty}</span>
            <button
              type="button"
              onClick={() => updateQty(line.lineId, line.qty + 1)}
              className="flex h-8 w-8 items-center justify-center text-ink-600 hover:text-brand-600"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-sm font-semibold text-ink-900">
            {formatNaira(line.lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
