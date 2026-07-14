import { query } from "@/lib/db";

export async function getRatingBreakdown(productId) {
  const rows = await query(
    "SELECT rating, COUNT(*) AS count FROM product_reviews WHERE product_id = ? GROUP BY rating",
    [productId]
  );
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return [5, 4, 3, 2, 1].map((stars) => {
    const row = rows.find((r) => r.rating === stars);
    const count = row?.count ?? 0;
    return { stars, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
  });
}
