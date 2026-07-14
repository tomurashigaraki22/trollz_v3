import { Zap } from "lucide-react";
import Section from "../ui/Section";
import ProductCard from "../ui/ProductCard";
import CountdownTimer from "./CountdownTimer";

export default function FlashDeals({ products = [] }) {
  if (products.length === 0) return null;

  const endsAt = products.reduce((earliest, product) => {
    if (!product.flashSaleEnd) return earliest;
    return !earliest || new Date(product.flashSaleEnd) < new Date(earliest)
      ? product.flashSaleEnd
      : earliest;
  }, null);

  return (
    <Section className="bg-brand-50/60 py-14 sm:py-16">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              Flash Deals
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Limited-time prices — grab them before they&apos;re gone.
            </p>
          </div>
        </div>
        {endsAt && <CountdownTimer endsAt={endsAt} />}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
