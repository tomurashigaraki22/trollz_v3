import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import Section from "../ui/Section";

export default function RequestProductBanner() {
  return (
    <Section className="pt-0 pb-14 sm:pb-16">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-brand-100 bg-brand-50 px-6 py-12 text-center sm:flex-row sm:justify-between sm:px-12 sm:text-left">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
            <Search className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-ink-600">
              Tell us what you need and we&apos;ll source it through our seller network — no
              endless searching required.
            </p>
          </div>
        </div>

        <Link
          href="/request-product"
          className="flex shrink-0 items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Request a Product
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Section>
  );
}
