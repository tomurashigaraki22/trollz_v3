import Hero from "./components/home/Hero";
import CategoryStrip from "./components/home/CategoryStrip";
import ValueProps from "./components/home/ValueProps";
import FlashDeals from "./components/home/FlashDeals";
import TrendingGrid from "./components/home/TrendingGrid";
import FeaturedGrid from "./components/home/FeaturedGrid";
import SellerBannerAdCarousel from "./components/home/SellerBannerAdCarousel";
import RequestProductBanner from "./components/home/RequestProductBanner";
import Newsletter from "./components/home/Newsletter";
import { getTopLevelCategories, getFlashSaleProducts, getTrendingProducts, getFeaturedProducts } from "@/lib/queries/products";
import { getActiveSellerBannerAds } from "@/lib/queries/sellerBannerAds";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, flashSaleProducts, trendingProducts, featuredProducts, sellerBannerAds] = await Promise.all([
    getTopLevelCategories(),
    getFlashSaleProducts(4),
    getTrendingProducts(8),
    getFeaturedProducts(20),
    getActiveSellerBannerAds(8),
  ]);

  return (
    <>
      <Hero />
      <SellerBannerAdCarousel ads={sellerBannerAds} />
      <CategoryStrip categories={categories} />
      <ValueProps />
      <FlashDeals products={flashSaleProducts} />
      <TrendingGrid products={trendingProducts} />
      <FeaturedGrid products={featuredProducts} />
      <RequestProductBanner />
      <Newsletter />
    </>
  );
}
