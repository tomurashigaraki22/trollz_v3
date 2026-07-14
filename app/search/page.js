import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import SearchPageClient from "../components/search/SearchPageClient";
import { searchProducts } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search - TrollzStore",
  description: "Search the TrollzStore catalog.",
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const initialQuery = typeof params?.hsearch === "string" ? params.hsearch : "";
  const results = initialQuery.trim() ? await searchProducts(initialQuery.trim()) : [];

  return (
    <>
      <PageHero eyebrow="Search" title="Find what you're looking for" />
      <Section>
        <SearchPageClient key={initialQuery} initialQuery={initialQuery} results={results} />
      </Section>
    </>
  );
}
