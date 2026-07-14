import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-brand-600">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-ink-800" : ""}>{item.label}</span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-ink-300" />}
          </span>
        );
      })}
    </nav>
  );
}
