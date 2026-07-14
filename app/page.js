import Hero from "./components/home/Hero";
import CategoryStrip from "./components/home/CategoryStrip";
import ValueProps from "./components/home/ValueProps";
import FlashDeals from "./components/home/FlashDeals";
import TrendingGrid from "./components/home/TrendingGrid";
import Newsletter from "./components/home/Newsletter";
import { getTopLevelCategories, getFlashSaleProducts, getTrendingProducts } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, flashSaleProducts, trendingProducts] = await Promise.all([
    getTopLevelCategories(),
    getFlashSaleProducts(4),
    getTrendingProducts(8),
  ]);

  return (
    <>
      <Hero />
      <CategoryStrip categories={categories} />
      <ValueProps />
      <FlashDeals products={flashSaleProducts} />
      <TrendingGrid products={trendingProducts} />
      <Newsletter />
    </>
  );
}
