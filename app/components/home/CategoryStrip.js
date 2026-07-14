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
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Shop by category
          </h2>
          <p className="mt-2 text-sm text-ink-500">
            Curated collections across everything you need.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/shop?category=${slugify(category.name)}`}
            className={`group relative flex min-h-[220px] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white transition-transform duration-300 hover:-translate-y-1 ${TONES[index % TONES.length]}`}
          >
            <h3 className="text-lg font-bold">{category.name}</h3>
            <p className="mt-1 text-sm text-white/80">
              {DESCRIPTIONS[category.name] ?? "Browse our full range of quality products."}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
              Explore
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
