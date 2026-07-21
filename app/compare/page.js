"use client";

import Image from "next/image";
import Link from "next/link";
import { GitCompare, X } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import PlaceholderImage from "../components/ui/PlaceholderImage";
import { useCompare } from "../components/compare/CompareProvider";
import { formatNaira } from "@/lib/mock/data";

export default function ComparePage() {
  const { products, productIds, toggle, clear } = useCompare();

  if (productIds.length === 0) {
    return (
      <>
        <PageHero eyebrow="Compare" title="Product Comparison" />
        <Section>
          <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
            <GitCompare className="h-12 w-12 text-ink-300" />
            <h2 className="mt-4 text-lg font-semibold text-ink-900">No products selected</h2>
            <p className="mt-1 text-sm text-ink-500">Tap the compare icon on products to compare up to four items.</p>
            <Button href="/shop" className="mt-6">Browse Products</Button>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Compare"
        title="Product Comparison"
        description={`${products.length} item${products.length === 1 ? "" : "s"} selected`}
      />
      <Section>
        <div className="mb-4 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={clear}>Clear comparison</Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
          <table className="min-w-[760px] w-full border-collapse text-sm">
            <tbody>
              <CompareRow label="Product">
                {products.map((product) => (
                  <td key={product.id} className="w-1/4 border-l border-ink-100 p-4 align-top">
                    <button
                      type="button"
                      onClick={() => toggle(product.id)}
                      className="float-right rounded-full p-1 text-ink-400 hover:bg-ink-100 hover:text-danger"
                      aria-label="Remove from comparison"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-ink-50">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.item} fill className="object-cover" />
                      ) : (
                        <PlaceholderImage className="h-full w-full" />
                      )}
                    </div>
                    <Link href={`/product/${product.id}`} className="font-semibold text-ink-900 hover:text-brand-600">
                      {product.item}
                    </Link>
                  </td>
                ))}
              </CompareRow>
              <CompareRow label="Price">{products.map((p) => <Cell key={p.id}>{formatNaira(p.price)}</Cell>)}</CompareRow>
              <CompareRow label="Old Price">{products.map((p) => <Cell key={p.id}>{formatNaira(p.originalPrice)}</Cell>)}</CompareRow>
              <CompareRow label="Discount">{products.map((p) => <Cell key={p.id}>{p.discount}%</Cell>)}</CompareRow>
              <CompareRow label="Rating">{products.map((p) => <Cell key={p.id}>{Number(p.rating).toFixed(1)} / 5 ({p.reviewCount})</Cell>)}</CompareRow>
              <CompareRow label="Category">{products.map((p) => <Cell key={p.id}>{p.category}</Cell>)}</CompareRow>
              <CompareRow label="Stock">{products.map((p) => <Cell key={p.id}>{p.qty > 0 ? `${p.qty} available` : "Out of stock"}</Cell>)}</CompareRow>
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

function CompareRow({ label, children }) {
  return (
    <tr className="border-b border-ink-100 last:border-b-0">
      <th className="w-36 bg-ink-50 p-4 text-left text-xs font-semibold uppercase text-ink-500">{label}</th>
      {children}
    </tr>
  );
}

function Cell({ children }) {
  return <td className="border-l border-ink-100 p-4 align-top text-ink-700">{children}</td>;
}
