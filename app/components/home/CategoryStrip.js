import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Apple01Icon,
  Briefcase01Icon,
  HealthIcon,
  Home03Icon,
  LaptopIcon,
  Shirt01Icon,
  ShoppingBag01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import Section from "../ui/Section";
import { slugify } from "@/lib/slugify";

const ICONS = {
  Computing: LaptopIcon,
  "Health & Beauty": HealthIcon,
  "Phones & Tablets": SmartPhone01Icon,
  Fashion: Shirt01Icon,
  "Home and Office": Home03Icon,
  Groceries: Apple01Icon,
  "Trollz.tm": ShoppingBag01Icon,
};

function CategoryIcon({ category, className }) {
  const icon = ICONS[category.name] ?? Briefcase01Icon;
  return <HugeiconsIcon icon={icon} className={className} strokeWidth={1.75} />;
}

export default function CategoryStrip({ categories = [] }) {
  if (categories.length === 0) return null;

  return (
    <Section className="pt-10 sm:pt-14">
      <h2 className="mb-5 text-lg font-bold tracking-tight text-ink-900 sm:text-2xl">
        Shop by category
      </h2>

      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-7">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${slugify(category.name)}`}
            className="group flex shrink-0 snap-start flex-col items-center gap-2.5 text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-700 shadow-sm ring-1 ring-ink-100 transition-colors duration-200 group-hover:bg-brand-500 group-hover:text-white group-hover:ring-brand-500 sm:h-20 sm:w-20">
              <CategoryIcon category={category} className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <span className="w-20 text-xs font-medium text-ink-700 sm:w-24 sm:text-sm">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
