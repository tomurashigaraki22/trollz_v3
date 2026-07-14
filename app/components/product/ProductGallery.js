"use client";

import { useState } from "react";
import Image from "next/image";
import PlaceholderImage from "../ui/PlaceholderImage";

const TONES = [
  "from-ink-100 to-ink-200",
  "from-brand-50 to-brand-200",
  "from-ink-50 to-ink-200",
  "from-brand-100 to-ink-200",
];

export default function ProductGallery({ name, images = [] }) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;
  const thumbs = hasImages ? images : TONES;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-ink-100">
        {hasImages ? (
          <Image
            src={images[active] ?? images[0]}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        ) : (
          <PlaceholderImage
            className="h-full w-full"
            tone={TONES[active % TONES.length]}
            iconClassName="h-16 w-16"
          />
        )}
      </div>
      {thumbs.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {thumbs.map((thumb, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${name} view ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl border transition-colors ${
                active === index ? "border-brand-500" : "border-ink-100 hover:border-ink-300"
              }`}
            >
              {hasImages ? (
                <Image src={thumb} alt="" fill sizes="120px" className="object-cover" />
              ) : (
                <PlaceholderImage className="h-full w-full" tone={thumb} iconClassName="h-6 w-6" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
