import { notFound } from "next/navigation";
import Section from "../../components/ui/Section";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import StarRating from "../../components/ui/StarRating";
import ProductCard from "../../components/ui/ProductCard";
import ProductGallery from "../../components/product/ProductGallery";
import ProductPurchasePanel from "../../components/product/ProductPurchasePanel";
import ProductReviews from "../../components/product/ProductReviews";
import { formatNaira } from "@/lib/mock/data";
import { slugify } from "@/lib/slugify";
import { getProductById, getRelatedProducts } from "@/lib/queries/products";
import { getRatingBreakdown } from "@/lib/queries/reviews";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};
  return {
    title: `${product.item} - TrollzStore`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const [related, breakdown] = await Promise.all([
    getRelatedProducts(product),
    getRatingBreakdown(product.id),
  ]);

  return (
    <>
      <Section className="pb-0">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.category, href: `/shop?category=${slugify(product.category)}` },
            { label: product.item },
          ]}
        />
      </Section>

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductGallery name={product.item} images={product.images} />

          <div>
            <span className="text-xs font-semibold tracking-wide text-brand-600 uppercase">
              {product.category}
              {product.subcategory ? ` / ${product.subcategory}` : ""}
            </span>
            <h1 className="mt-2 text-2xl font-bold text-ink-900 sm:text-3xl">{product.item}</h1>

            <div className="mt-3">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-ink-900">
                {formatNaira(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-ink-400 line-through">
                    {formatNaira(product.originalPrice)}
                  </span>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
                    -{product.discount}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-2 text-sm">
              {product.qty > 0 ? (
                <span className="font-medium text-green-600">{product.qty} in stock</span>
              ) : (
                <span className="font-medium text-danger">Out of stock</span>
              )}
            </p>

            <p className="mt-5 leading-6 text-ink-600">{product.description}</p>

            <div className="mt-6 border-t border-ink-100 pt-6">
              <ProductPurchasePanel product={product} />
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-t border-ink-100">
        <h2 className="mb-6 text-xl font-bold text-ink-900">Ratings & Reviews</h2>
        <ProductReviews rating={product.rating} reviewCount={product.reviewCount} breakdown={breakdown} />
      </Section>

      {related.length > 0 && (
        <Section className="border-t border-ink-100">
          <h2 className="mb-6 text-xl font-bold text-ink-900">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
