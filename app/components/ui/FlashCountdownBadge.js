"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function formatTimeLeft(endsAt) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m ${seconds}s left`;
}

// Compact per-card countdown for flash-sale products. Ticks every second so
// short (< 1hr) windows read accurately; longer windows just look stable
// since the displayed unit (days/hours) barely changes second to second.
export default function FlashCountdownBadge({ endsAt, className = "" }) {
  const [label, setLabel] = useState(() => formatTimeLeft(endsAt));

  useEffect(() => {
    const interval = setInterval(() => setLabel(formatTimeLeft(endsAt)), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-ink-900/90 px-2 py-1 text-[10px] font-semibold tabular-nums text-white ${className}`}
    >
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
}
