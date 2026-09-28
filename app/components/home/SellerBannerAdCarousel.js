"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { qaImg } from "@/lib/debugImages";

export default function SellerBannerAdCarousel({ ads = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (ads.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % ads.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [ads.length]);

  if (!ads.length) return null;

  return (
    <section className="bg-ink-50 py-5 sm:py-7" aria-label="Sponsored seller banners">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/5] overflow-hidden rounded-2xl bg-ink-900 shadow-sm sm:aspect-[1920/420]">
          {ads.map((ad, index) => {
            const content = (
              <img
                src={qaImg(ad.image_url)}
                alt={`${ad.seller_name || "Seller"} sponsored banner`}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
              />
            );
            return ad.target_url ? (
              <a key={ad.id} href={ad.target_url} target="_blank" rel="noopener noreferrer" className={`absolute inset-0 ${index === activeIndex ? "pointer-events-auto" : "pointer-events-none"}`}>
                {content}
              </a>
            ) : (
              <Link key={ad.id} href="/shop" className={`absolute inset-0 ${index === activeIndex ? "pointer-events-auto" : "pointer-events-none"}`}>
                {content}
              </Link>
            );
          })}
          <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">Sponsored</span>
          {ads.length > 1 && (
            <div className="absolute right-4 bottom-4 flex gap-1.5">
              {ads.map((ad, index) => (
                <button key={`${ad.id}-${index}`} type="button" aria-label={`Show sponsored banner ${index + 1}`} onClick={() => setActiveIndex(index)} className={`h-2 rounded-full transition-all ${index === activeIndex ? "w-6 bg-white" : "w-2 bg-white/55"}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

