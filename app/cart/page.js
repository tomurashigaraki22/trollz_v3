"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import CartLineItem from "../components/cart/CartLineItem";
import { formatNaira } from "@/lib/mock/data";
import { useCart } from "../components/cart/CartProvider";

export default function CartPage() {
  const { lines, itemCount, subtotal, shippingFee, total, freeShippingThreshold, hydrated } =
    useCart();

  if (hydrated && lines.length === 0) {
    return (
      <>
        <PageHero eyebrow="Cart" title="Your Cart" />
        <Section>
          <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
            <ShoppingBag className="h-12 w-12 text-ink-300" />
            <h2 className="mt-4 text-lg font-semibold text-ink-900">Your cart is empty</h2>
            <p className="mt-1 text-sm text-ink-500">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Button href="/shop" className="mt-6">
              Continue Shopping
            </Button>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow="Cart" title="Your Cart" description={`${itemCount} item${itemCount === 1 ? "" : "s"} in your cart`} />
      <Section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <Card className="p-5 sm:p-6">
            {lines.map((line) => (
              <CartLineItem key={line.lineId} line={line} />
            ))}
          </Card>

          <Card className="h-fit p-6">
            <h2 className="text-base font-semibold text-ink-900">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-600">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? "Free" : formatNaira(shippingFee)}</span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-ink-400">
                  Free shipping on orders over {formatNaira(freeShippingThreshold)}
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-between border-t border-ink-100 pt-4 text-base font-bold text-ink-900">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>

            <Button href="/checkout" size="lg" className="mt-6 w-full">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link
              href="/shop"
              className="mt-3 block text-center text-sm font-medium text-ink-500 hover:text-brand-600"
            >
              Continue Shopping
            </Link>
          </Card>
        </div>
      </Section>
    </>
  );
}
