import { Star } from "lucide-react";

export default function StarRating({ rating = 0, reviewCount, size = "h-4 w-4" }) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-brand-500">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={size}
            fill={index < rounded ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {typeof reviewCount === "number" && (
        <span className="text-xs text-ink-500">({reviewCount})</span>
      )}
    </div>
  );
}
