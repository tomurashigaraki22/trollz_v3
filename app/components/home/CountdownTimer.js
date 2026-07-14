"use client";

import { useEffect, useState } from "react";

function getTimeLeft(endsAt) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(endsAt));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(endsAt)), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  const units = timeLeft;

  return (
    <div className="flex items-center gap-2">
      {[
        ["hrs", units.hours],
        ["min", units.minutes],
        ["sec", units.seconds],
      ].map(([label, value]) => (
        <div
          key={label}
          className="flex min-w-13 flex-col items-center rounded-lg bg-ink-900 px-3 py-1.5 text-white"
        >
          <span className="text-sm font-bold tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[10px] tracking-wide text-ink-400 uppercase">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
