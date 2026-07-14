import { SITE_URL } from "@/lib/site";
import { getAllProductIds } from "@/lib/queries/products";

const staticRoutes = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap() {
  const now = new Date();

  const staticEntries = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productIds = await getAllProductIds();
  const productEntries = productIds.map((id) => ({
    url: `${SITE_URL}/product/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries];
}
