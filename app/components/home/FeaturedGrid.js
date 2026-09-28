import Section from "../ui/Section";
import Button from "../ui/Button";
import ProductCard from "../ui/ProductCard";

export default function FeaturedGrid({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <Section>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">Featured</h2>
          <p className="mt-2 text-sm text-ink-500">A fresh selection of products picked for you.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
      <div className="mt-10 flex justify-center">
        <Button href="/shop" variant="outline">View All Products</Button>
      </div>
    </Section>
  );
}

