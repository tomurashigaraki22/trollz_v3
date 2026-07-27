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

// Gradient per category, chosen to echo what the category actually is
// (tech = blue, groceries = green, beauty = pink, etc.) rather than an
// arbitrary rotating palette.
const GRADIENTS = {
  Computing: "from-sky-500 to-blue-600",
  "Health & Beauty": "from-pink-400 to-fuchsia-500",
  "Phones & Tablets": "from-violet-500 to-indigo-600",
  Fashion: "from-rose-500 to-orange-500",
  "Home and Office": "from-teal-500 to-cyan-600",
  Groceries: "from-lime-500 to-green-600",
  "Trollz.tm": "from-brand-500 to-brand-700",
};
const DEFAULT_GRADIENT = "from-ink-600 to-ink-800";

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

      <div className="scrollbar-hide -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-7">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${slugify(category.name)}`}
            className="group flex shrink-0 snap-start flex-col items-center gap-2 text-center"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-16 ${
                GRADIENTS[category.name] ?? DEFAULT_GRADIENT
              }`}
            >
              <CategoryIcon category={category} className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="w-16 text-[11px] font-medium text-ink-700 sm:w-20 sm:text-xs">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
