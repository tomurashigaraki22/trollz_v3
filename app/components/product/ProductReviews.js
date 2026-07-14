import { Star } from "lucide-react";

export default function ProductReviews({ rating, reviewCount, breakdown }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-100 p-8 text-center">
        <p className="text-sm font-medium text-ink-500">Based on {reviewCount} reviews</p>
        <p className="mt-2 text-5xl font-extrabold text-ink-900">{rating.toFixed(1)}</p>
        <div className="mt-3 flex items-center gap-1 text-brand-500">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="h-5 w-5"
              fill={index < Math.round(rating) ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {breakdown.map((row) => (
          <div key={row.stars} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-sm text-ink-600">{row.stars} Star</span>
            <div className="h-1.5 w-full rounded-full bg-ink-100">
              <div
                className="h-1.5 rounded-full bg-brand-500"
                style={{ width: `${row.percent}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm text-ink-500">{row.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
