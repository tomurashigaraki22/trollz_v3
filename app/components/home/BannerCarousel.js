"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { qaImg } from "@/lib/debugImages";

const ACTION_CLASSES =
  "absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-ink-950/25 transition hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function isExternalHref(href) {
  return /^https?:\/\//i.test(href);
}

function ActionButton({ slide }) {
  const button = slide.button;
  if (!button?.label || !button.href) return null;

  const props = {
    className: ACTION_CLASSES,
    style: {
      left: `${button.x ?? 82}%`,
      top: `${button.y ?? 80}%`,
    },
  };

  if (isExternalHref(button.href)) {
    return (
      <a href={button.href} target="_blank" rel="noopener noreferrer" {...props}>
        {button.label}
      </a>
    );
  }

  return (
    <Link href={button.href} {...props}>
      {button.label}
    </Link>
  );
}

export default function BannerCarousel({ slides, images, alt, className = "", imageClassName = "" }) {
  const cleanSlides = (slides?.length ? slides : (images ?? []).map((url) => ({ type: "image", url }))).filter(
    (slide) => slide?.url
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef({});
  const visibleIndex = Math.min(activeIndex, Math.max(cleanSlides.length - 1, 0));

  useEffect(() => {
    if (cleanSlides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % cleanSlides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [cleanSlides.length]);

  useEffect(() => {
    const video = videoRefs.current[visibleIndex];
    if (!video) return undefined;
    video.currentTime = 0;
    const playPromise = video.play();
    playPromise?.catch(() => {});
    return () => video.pause();
  }, [visibleIndex]);

  if (cleanSlides.length === 0) return null;

  return (
    <section className={`relative overflow-hidden bg-ink-950 ${className}`}>
      {cleanSlides.map((slide, index) => {
        const isVideo = slide.type === "video";
        const isActive = index === visibleIndex;
        return (
          <div
            key={slide.id || `${slide.url}-${index}`}
            className={`absolute inset-0 transition-opacity duration-700 ${
              isActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!isActive}
          >
            {isVideo ? (
              <video
                ref={(node) => {
                  if (node) videoRefs.current[index] = node;
                  else delete videoRefs.current[index];
                }}
                src={qaImg(slide.url)}
                muted
                autoPlay={isActive}
                loop
                playsInline
                preload={isActive ? "metadata" : "none"}
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src={qaImg(slide.url)}
                alt={alt}
                className={`h-full w-full object-contain ${imageClassName}`}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            )}
            {isActive && <ActionButton slide={slide} />}
          </div>
        );
      })}

      {cleanSlides.length > 1 && (
        <div className="absolute right-4 bottom-4 z-20 flex gap-1.5">
          {cleanSlides.map((slide, index) => (
            <button
              key={`${slide.id || slide.url}-dot-${index}`}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === visibleIndex ? "w-6 bg-white" : "w-2 bg-white/55"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
