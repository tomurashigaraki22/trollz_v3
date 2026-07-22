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

const TILES = [
  "bg-brand-50 text-brand-700",
  "bg-warning/10 text-warning",
  "bg-info/10 text-info",
  "bg-success/10 text-success",
  "bg-danger/10 text-danger",
  "bg-purple-50 text-purple-600",
  "bg-ink-50 text-ink-700",
  "bg-emerald-50 text-emerald-600",
];

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
  if (category.icon) {
    return <img src={category.icon} alt="" className={className} />;
  }
  const icon = ICONS[category.name] ?? Briefcase01Icon;
  return <HugeiconsIcon icon={icon} className={className} strokeWidth={1.75} />;
}

export default function CategoryStrip({ categories = [] }) {
  if (categories.length === 0) return null;
  const visibleCategories = categories.slice(0, 8);

  return (
    <Section className="pt-10 sm:pt-14">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink-900 sm:text-2xl">
            Shop by category
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {visibleCategories.map((category, index) => (
          <Link
            key={category.id}
            href={`/shop?category=${slugify(category.name)}`}
            className={`group flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl px-2 py-3 text-center transition-transform duration-200 hover:-translate-y-0.5 sm:min-h-28 sm:rounded-2xl ${TILES[index % TILES.length]}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 shadow-sm sm:h-11 sm:w-11">
              <CategoryIcon category={category} className="h-5 w-5 object-contain sm:h-6 sm:w-6" />
            </div>
            <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-ink-900 sm:text-sm">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
