"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import PlaceholderImage from "../ui/PlaceholderImage";
import { qaImg } from "@/lib/debugImages";

const TONES = [
  "from-ink-100 to-ink-200",
  "from-brand-50 to-brand-200",
  "from-ink-50 to-ink-200",
  "from-brand-100 to-ink-200",
];

export default function ProductGallery({ name, images = [], videoUrl, videoMime }) {
  const [active, setActive] = useState(0);
  const media = [
    ...images.map((url) => ({ type: "image", url })),
    ...(videoUrl ? [{ type: "video", url: videoUrl, mime: videoMime || "video/mp4" }] : []),
  ];
  const hasMedia = media.length > 0;
  const activeMedia = media[active] ?? media[0];

  function renderMedia(item, thumbnail = false) {
    if (item?.type === "video") {
      return (
        <>
          <video
            src={qaImg(item.url)}
            poster={images[0] ? qaImg(images[0]) : undefined}
            muted={thumbnail}
            controls={!thumbnail}
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
          {thumbnail && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
              <Play className="h-7 w-7 fill-current drop-shadow" />
            </span>
          )}
        </>
      );
    }

    return (
      <Image
        src={qaImg(item.url)}
        alt={thumbnail ? "" : name}
        fill
        sizes={thumbnail ? "120px" : "(max-width: 1024px) 100vw, 50vw"}
        className="object-cover"
        priority={!thumbnail}
      />
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-ink-100">
        {hasMedia ? (
          renderMedia(activeMedia)
        ) : (
          <PlaceholderImage
            className="h-full w-full"
            tone={TONES[active % TONES.length]}
            iconClassName="h-16 w-16"
          />
        )}
      </div>
      {hasMedia && media.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {media.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${name} ${item.type === "video" ? "video" : `view ${index + 1}`}`}
              className={`relative aspect-square overflow-hidden rounded-xl border transition-colors ${
                active === index ? "border-brand-500" : "border-ink-100 hover:border-ink-300"
              }`}
            >
              {renderMedia(item, true)}
            </button>
          ))}
        </div>
      )}

      {!hasMedia && TONES.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {TONES.map((tone, index) => (
            <button
              key={tone}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${name} placeholder view ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl border transition-colors ${
                active === index ? "border-brand-500" : "border-ink-100 hover:border-ink-300"
              }`}
            >
              <PlaceholderImage className="h-full w-full" tone={tone} iconClassName="h-6 w-6" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
