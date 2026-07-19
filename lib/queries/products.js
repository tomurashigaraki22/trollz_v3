import { query } from "@/lib/db";

function safeJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

// `price` in the real `product` table already has a ~10% baseline cut baked
// in relative to `old_price` (a store-wide discount, not the unrelated
// `discount` column). `is_flash_sale` layers a deeper, time-boxed discount
// via `flash_sale_price` on top of that. We compute the displayed discount
// from the price/old_price ratio rather than trusting the stored `discount`
// column, which doesn't reflect the actual price shown.
function parseProductRow(row) {
  const images = safeJsonArray(row.img);
  const sizeOptions = row.size_type && row.size_type !== "none" ? safeJsonArray(row.size_options) : [];
  const colorOptions = safeJsonArray(row.color_options);

  const flashActive =
    Boolean(row.is_flash_sale) &&
    row.flash_sale_price != null &&
    (!row.flash_sale_end || new Date(row.flash_sale_end) > new Date());

  const originalPrice = Number(row.old_price ?? row.price);
  const effectivePrice = flashActive ? Number(row.flash_sale_price) : Number(row.price);
  const discount =
    originalPrice > effectivePrice ? Math.round((1 - effectivePrice / originalPrice) * 100) : 0;

  return {
    id: row.id,
    item: row.item,
    category: row.category,
    subcategory: row.subcategory || "",
    price: effectivePrice,
    originalPrice,
    discount,
    qty: row.qty ?? 0,
    description: row.description || "",
    sizeOptions: sizeOptions.length > 0 ? sizeOptions : ["Standard"],
    colorOptions: colorOptions.length > 0 ? colorOptions : ["Default"],
    images,
    rating: row.avg_rating ? Number(row.avg_rating) : 0,
    reviewCount: row.review_count ? Number(row.review_count) : 0,
    isFlashSale: flashActive,
    flashSaleEnd: row.flash_sale_end,
  };
}

const REVIEW_JOIN = `
  LEFT JOIN (
    SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS review_count
    FROM product_reviews
    GROUP BY product_id
  ) r ON r.product_id = p.id
`;

export async function getTopLevelCategories() {
  const rows = await query(
    "SELECT id, category AS name, bg_color, icon FROM category WHERE parent_id IS NULL ORDER BY id"
  );
  return rows;
}

export async function getFlashSaleProducts(limit = 4) {
  const rows = await query(
    `SELECT p.*, r.avg_rating, r.review_count FROM product p
     ${REVIEW_JOIN}
     WHERE p.is_flash_sale = 1 AND (p.flash_sale_end IS NULL OR p.flash_sale_end > NOW())
     ORDER BY p.flash_sale_end ASC
     LIMIT ?`,
    [limit]
  );
  return rows.map(parseProductRow);
}

export async function getFlashSaleProductsPage({ limit = 24, offset = 0 } = {}) {
  const rows = await query(
    `SELECT p.*, r.avg_rating, r.review_count FROM product p
     ${REVIEW_JOIN}
     WHERE p.is_flash_sale = 1 AND (p.flash_sale_end IS NULL OR p.flash_sale_end > NOW())
     ORDER BY p.flash_sale_end ASC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows.map(parseProductRow);
}

export async function getFlashSaleProductsCount() {
  const rows = await query(
    "SELECT COUNT(*) AS count FROM product WHERE is_flash_sale = 1 AND (flash_sale_end IS NULL OR flash_sale_end > NOW())"
  );
  return rows[0].count;
}

export async function getTrendingProducts(limit = 8) {
  // Most rows share the same (often zero) view count, so a plain
  // `ORDER BY views DESC` ties break on id and shows the identical set of
  // products on every load. RAND() as the tiebreaker keeps real view-count
  // signal where it exists but shuffles within each tied group.
  const rows = await query(
    `SELECT p.*, r.avg_rating, r.review_count FROM product p
     ${REVIEW_JOIN}
     ORDER BY p.views DESC, RAND()
     LIMIT ?`,
    [limit]
  );
  return rows.map(parseProductRow);
}

function buildProductWhere({ category, maxPrice }) {
  const where = [];
  const params = [];

  if (category) {
    where.push("p.category = ?");
    params.push(category);
  }
  if (maxPrice) {
    where.push("p.price <= ?");
    params.push(maxPrice);
  }

  return { whereClause: where.length > 0 ? `WHERE ${where.join(" AND ")}` : "", params };
}

export async function getProducts({ category, maxPrice, sort = "featured", limit = 24, offset = 0 } = {}) {
  const { whereClause, params } = buildProductWhere({ category, maxPrice });

  const orderBy =
    {
      "price-asc": "p.price ASC",
      "price-desc": "p.price DESC",
      rating: "r.avg_rating DESC",
      newest: "p.date DESC",
      // "featured" (the default) is intentionally shuffled — with no
      // curated ranking to fall back on, a fixed order just meant the same
      // products at the top of every page load. Seeding RAND() with the
      // current day (not a bare RAND()) keeps the order stable across a
      // paginated browsing session instead of reshuffling — and skipping or
      // repeating products — between page 1 and page 2, while still giving
      // a fresh order daily.
    }[sort] ?? "RAND(FLOOR(UNIX_TIMESTAMP(NOW()) / 86400))";

  const rows = await query(
    `SELECT p.*, r.avg_rating, r.review_count FROM product p
     ${REVIEW_JOIN}
     ${whereClause}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return rows.map(parseProductRow);
}

export async function getProductsCount({ category, maxPrice } = {}) {
  const { whereClause, params } = buildProductWhere({ category, maxPrice });
  const rows = await query(`SELECT COUNT(*) AS count FROM product p ${whereClause}`, params);
  return rows[0].count;
}

export async function getProductById(id) {
  const rows = await query(
    `SELECT p.*, r.avg_rating, r.review_count FROM product p
     ${REVIEW_JOIN}
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  return parseProductRow(rows[0]);
}

export async function getProductsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const rows = await query(
    `SELECT p.*, r.avg_rating, r.review_count FROM product p
     ${REVIEW_JOIN}
     WHERE p.id IN (${ids.map(() => "?").join(",")})`,
    ids
  );
  return rows.map(parseProductRow);
}

export async function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  const rows = await query(
    `SELECT p.*, r.avg_rating, r.review_count FROM product p
     ${REVIEW_JOIN}
     WHERE p.category = ? AND p.id != ?
     ORDER BY p.views DESC
     LIMIT ?`,
    [product.category, product.id, limit]
  );
  return rows.map(parseProductRow);
}

export async function searchProducts(term, limit = 24) {
  const like = `%${term}%`;
  const rows = await query(
    `SELECT p.*, r.avg_rating, r.review_count FROM product p
     ${REVIEW_JOIN}
     WHERE p.item LIKE ? OR p.category LIKE ? OR p.subcategory LIKE ?
     ORDER BY p.views DESC
     LIMIT ?`,
    [like, like, like, limit]
  );
  return rows.map(parseProductRow);
}

export async function getAllProductIds() {
  const rows = await query("SELECT id FROM product");
  return rows.map((row) => row.id);
}
