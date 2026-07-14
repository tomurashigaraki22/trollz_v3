import { ImageIcon } from "lucide-react";

// Stand-in for real product/category photography until Cloudinary is wired
// up in Phase 2. Keeps layout/aspect-ratio identical to the final <Image />.
export default function PlaceholderImage({
  className = "",
  tone = "from-ink-100 to-ink-200",
  iconClassName = "h-8 w-8",
}) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br text-ink-400 ${tone} ${className}`}
    >
      <ImageIcon className={iconClassName} strokeWidth={1.25} />
    </div>
  );
}
