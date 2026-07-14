"use client";

import { Heart } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import ProductCard from "../components/ui/ProductCard";
import { useWishlist } from "../components/wishlist/WishlistProvider";

export default function WishlistPage() {
  const { products, hydrated } = useWishlist();

  if (hydrated && products.length === 0) {
    return (
      <>
        <PageHero eyebrow="Wishlist" title="Your Wishlist" />
        <Section>
          <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
            <Heart className="h-12 w-12 text-ink-300" />
            <h2 className="mt-4 text-lg font-semibold text-ink-900">Your wishlist is empty</h2>
            <p className="mt-1 text-sm text-ink-500">
              Tap the heart icon on any product to save it for later.
            </p>
            <Button href="/shop" className="mt-6">
              Browse Products
            </Button>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Wishlist"
        title="Your Wishlist"
        description={`${products.length} saved item${products.length === 1 ? "" : "s"}`}
      />
      <Section>
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Section>
    </>
  );
}
