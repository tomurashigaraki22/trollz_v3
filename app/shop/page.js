import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import ShopPageClient from "../components/shop/ShopPageClient";
import { slugify } from "@/lib/slugify";
import { getProducts, getProductsCount, getTopLevelCategories } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop All Products - TrollzStore",
  description: "Browse fashion, electronics, home & lifestyle, and beauty products at TrollzStore.",
};

const PAGE_SIZE = 24;

export default async function ShopPage({ searchParams }) {
  const params = await searchParams;
  const categories = await getTopLevelCategories();

  const categorySlug = typeof params?.category === "string" ? params.category : null;
  const matchedCategory = categories.find((category) => slugify(category.name) === categorySlug);
  const maxPrice = params?.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = typeof params?.sort === "string" ? params.sort : "featured";
  const page = Math.max(1, Number(params?.page) || 1);

  const filters = { category: matchedCategory?.name, maxPrice, sort };

  const [products, totalCount] = await Promise.all([
    getProducts({ ...filters, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    getProductsCount(filters),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <>
      <PageHero
        eyebrow="Shop"
        title={matchedCategory ? matchedCategory.name : "All Products"}
        description={`${totalCount.toLocaleString()} product${totalCount === 1 ? "" : "s"} available`}
      />
      <Section>
        <ShopPageClient
          products={products}
          categories={categories}
          selectedCategory={matchedCategory?.name ?? null}
          maxPrice={maxPrice}
          sort={sort}
          page={page}
          totalPages={totalPages}
        />
      </Section>
    </>
  );
}
