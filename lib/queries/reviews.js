import { query } from "@/lib/db";

let reviewTableReady = false;

async function ensureReviewTable() {
  if (reviewTableReady) return;

  await query(`
    CREATE TABLE IF NOT EXISTS product_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      user_id INT NULL,
      name VARCHAR(255) NULL,
      rating INT NOT NULL,
      title VARCHAR(255) NULL,
      comment TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_product_review (product_id, user_id),
      INDEX product_reviews_product_idx (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const columns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'product_reviews'"
  );
  const existing = new Set(columns.map((row) => row.COLUMN_NAME || row.column_name));
  const additions = [
    ["user_id", "ALTER TABLE product_reviews ADD COLUMN user_id INT NULL"],
    ["name", "ALTER TABLE product_reviews ADD COLUMN name VARCHAR(255) NULL"],
    ["title", "ALTER TABLE product_reviews ADD COLUMN title VARCHAR(255) NULL"],
    ["comment", "ALTER TABLE product_reviews ADD COLUMN comment TEXT NULL"],
    ["created_at", "ALTER TABLE product_reviews ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"],
  ];

  for (const [column, sql] of additions) {
    if (!existing.has(column)) {
      await query(sql);
    }
  }

  const indexes = await query(
    "SELECT index_name FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'product_reviews'"
  );
  const indexNames = new Set(indexes.map((row) => row.INDEX_NAME || row.index_name));
  if (!indexNames.has("unique_user_product_review")) {
    try {
      await query(
        "ALTER TABLE product_reviews ADD UNIQUE KEY unique_user_product_review (product_id, user_id)"
      );
    } catch {
      // Existing historical duplicate reviews should not block product pages.
    }
  }

  reviewTableReady = true;
}

export async function getRatingBreakdown(productId) {
  await ensureReviewTable();
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

export async function getProductReviews(productId, limit = 12) {
  await ensureReviewTable();
  return query(
    `SELECT pr.id, pr.rating, pr.title, pr.comment, pr.created_at,
       COALESCE(u.name, pr.name, 'Trollz customer') AS reviewer_name
     FROM product_reviews pr
     LEFT JOIN users u ON u.id = pr.user_id
     WHERE pr.product_id = ?
     ORDER BY pr.created_at DESC, pr.id DESC
     LIMIT ?`,
    [productId, limit]
  );
}

export async function upsertProductReview({ productId, userId, name, rating, title, comment }) {
  await ensureReviewTable();
  await query(
    `INSERT INTO product_reviews (product_id, user_id, name, rating, title, comment)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       rating = VALUES(rating),
       title = VALUES(title),
       comment = VALUES(comment),
       name = VALUES(name),
       created_at = CURRENT_TIMESTAMP`,
    [productId, userId ?? null, name, rating, title, comment]
  );
}
