import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Section from "../ui/Section";
import { slugify } from "@/lib/slugify";

const TONES = [
  "from-brand-500 to-brand-700",
  "from-ink-800 to-ink-900",
  "from-ink-600 to-ink-800",
  "from-brand-400 to-brand-600",
];

const DESCRIPTIONS = {
  Fashion: "Everyday wear and statement pieces for every occasion.",
  "Phones & Tablets": "Latest phones, tablets and accessories from trusted brands.",
  Computing: "Laptops, audio and gadgets to power your day.",
  "Home and Office": "Everything to make your space feel like home.",
  "Health & Beauty": "Skincare and grooming essentials, curated for you.",
  Groceries: "Everyday essentials, delivered to your door.",
};

export default function CategoryStrip({ categories = [] }) {
  if (categories.length === 0) return null;

  return (
    <Section className="pt-16 sm:pt-20">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
            Shop by category
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Curated collections across everything you need.
          </p>
        </div>
      </div>

      <div className="grid grid-flow-col grid-rows-2 gap-3 overflow-x-auto pb-2 [grid-auto-columns:minmax(132px,1fr)] sm:[grid-auto-columns:minmax(170px,1fr)] lg:grid-flow-row lg:grid-cols-4 lg:grid-rows-2 lg:overflow-visible">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/shop?category=${slugify(category.name)}`}
            className={`group flex min-h-20 items-center justify-between gap-3 rounded-2xl bg-gradient-to-br px-4 py-3 text-white transition-transform duration-300 hover:-translate-y-0.5 ${TONES[index % TONES.length]}`}
          >
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold">{category.name}</h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-white/75">
                {DESCRIPTIONS[category.name] ?? "Quality products"}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </Section>
  );
}
