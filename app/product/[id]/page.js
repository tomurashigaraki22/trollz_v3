import { notFound } from "next/navigation";
import Section from "../../components/ui/Section";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import StarRating from "../../components/ui/StarRating";
import ProductCard from "../../components/ui/ProductCard";
import ProductGallery from "../../components/product/ProductGallery";
import ProductPurchasePanel from "../../components/product/ProductPurchasePanel";
import ProductReviews from "../../components/product/ProductReviews";
import RecentlyViewedProducts, { ProductViewTracker } from "../../components/product/RecentlyViewedProducts";
import RestockNotificationForm from "../../components/product/RestockNotificationForm";
import ShareProductButton from "../../components/product/ShareProductButton";
import { formatNaira } from "@/lib/mock/data";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, truncateMeta } from "@/lib/site";
import { slugify } from "@/lib/slugify";
import { getProductById, getRelatedProducts } from "@/lib/queries/products";
import { getProductReviews, getRatingBreakdown } from "@/lib/queries/reviews";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};
  const title = `${product.item} - ${SITE_NAME}`;
  const description = truncateMeta(
    product.description || `Buy ${product.item} on ${SITE_NAME}. ${product.category} products with secure checkout.`
  );
  const url = `${SITE_URL}/product/${product.id}`;
  const image = absoluteUrl(product.images?.[0] || DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.item,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "NGN",
      "product:availability": product.qty > 0 ? "in stock" : "out of stock",
      "og:price:amount": String(product.price),
      "og:price:currency": "NGN",
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const [related, breakdown, reviews, user] = await Promise.all([
    getRelatedProducts(product),
    getRatingBreakdown(product.id),
    getProductReviews(product.id),
    getCurrentUser(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.item,
            description: truncateMeta(product.description, 500),
            image: product.images?.map((image) => absoluteUrl(image)) ?? [],
            sku: String(product.id),
            brand: {
              "@type": "Brand",
              name: SITE_NAME,
            },
            category: product.subcategory || product.category,
            aggregateRating:
              product.reviewCount > 0
                ? {
                    "@type": "AggregateRating",
                    ratingValue: Number(product.rating).toFixed(1),
                    reviewCount: product.reviewCount,
                  }
                : undefined,
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/product/${product.id}`,
              priceCurrency: "NGN",
              price: product.price,
              availability:
                product.qty > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          }),
        }}
      />
      <ProductViewTracker productId={product.id} />
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

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} />
              <ShareProductButton productName={product.item} />
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

            {product.qty <= 0 && (
              <div className="mt-4">
                <RestockNotificationForm productId={product.id} userEmail={user?.email} />
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section className="border-t border-ink-100">
        <h2 className="mb-6 text-xl font-bold text-ink-900">Ratings & Reviews</h2>
        <ProductReviews
          productId={product.id}
          rating={product.rating}
          reviewCount={product.reviewCount}
          breakdown={breakdown}
          reviews={reviews}
          canReview={Boolean(user)}
        />
      </Section>

      <Section className="border-t border-ink-100">
        <h2 className="mb-6 text-xl font-bold text-ink-900">Recently viewed</h2>
        <RecentlyViewedProducts currentProductId={product.id} />
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
