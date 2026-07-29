import { ArrowRight } from "lucide-react";
import Container from "../ui/Container";
import Button from "../ui/Button";
import BannerCarousel from "./BannerCarousel";
import { getBanner } from "@/lib/queries/banner";

export const dynamic = "force-dynamic";

function DefaultHero({ className = "" }) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-900 to-brand-800 ${className}`}>
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--color-brand-400) 0, transparent 45%), radial-gradient(circle at 80% 60%, var(--color-brand-500) 0, transparent 40%)",
        }}
      />
      <Container className="relative flex flex-col items-start gap-6 py-20 sm:py-28 lg:py-32">
        <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-200 uppercase">
          Nigeria&apos;s everyday shopping destination
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Shop with Confidence. Every Seller is Verified. Every Order is Protected.
        </h1>
        <p className="max-w-xl text-base leading-7 text-ink-300 sm:text-lg">
          Discover authentic products from trusted Nigerian businesses, backed
          by secure payments, order tracking, and dedicated customer support.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button href="/shop" size="lg">
            Explore Collections
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/shop?tab=flash" variant="outline" size="lg" className="border-white/30 text-white hover:border-white hover:text-white">
            View Flash Deals
          </Button>
        </div>
      </Container>
    </section>
  );
}

export default async function Hero() {
  const banner = await getBanner();
  const desktopImages = banner.desktop_image_urls ?? [];
  const mobileImages = banner.mobile_image_urls ?? [];
  const hasCustomBanner = desktopImages.length > 0 || mobileImages.length > 0;

  if (hasCustomBanner) {
    return (
      <>
        {mobileImages.length > 0 ? (
          <BannerCarousel
            images={mobileImages}
            alt="Trollz Store mobile banner"
            className="aspect-[4/3] sm:hidden"
          />
        ) : (
          <DefaultHero className="sm:hidden" />
        )}

        {desktopImages.length > 0 ? (
          <BannerCarousel
            images={desktopImages}
            alt="Trollz Store desktop banner"
            className="hidden aspect-[1920/520] sm:block"
          />
        ) : (
          <DefaultHero className="hidden sm:block" />
        )}
      </>
    );
  }

  return <DefaultHero />;
}
