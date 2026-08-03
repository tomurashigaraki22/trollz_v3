"use client";

import { useEffect, useState } from "react";
import { qaImg } from "@/lib/debugImages";

export default function BannerCarousel({ images, alt, className = "", imageClassName = "" }) {
  const cleanImages = (images ?? []).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (cleanImages.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % cleanImages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [cleanImages.length]);

  if (cleanImages.length === 0) return null;

  return (
    <section className={`relative overflow-hidden bg-ink-950 ${className}`}>
      {cleanImages.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={qaImg(image)}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          } ${imageClassName}`}
          fetchPriority={index === 0 ? "high" : "auto"}
        />
      ))}

      {cleanImages.length > 1 && (
        <div className="absolute right-4 bottom-4 flex gap-1.5">
          {cleanImages.map((image, index) => (
            <button
              key={`${image}-dot-${index}`}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-white" : "w-2 bg-white/55"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
