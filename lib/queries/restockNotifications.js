import { query } from "@/lib/db";

let restockTableReady = false;

async function ensureRestockTable() {
  if (restockTableReady) return;
  await query(`
    CREATE TABLE IF NOT EXISTS restock_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      user_id INT NULL,
      email VARCHAR(255) NOT NULL,
      status ENUM('pending','sent','cancelled') NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      notified_at DATETIME NULL,
      UNIQUE KEY unique_restock_email_product (product_id, email),
      INDEX restock_product_idx (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  restockTableReady = true;
}

export async function createRestockNotification({ productId, userId, email }) {
  await ensureRestockTable();
  await query(
    `INSERT INTO restock_notifications (product_id, user_id, email)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE status = 'pending', user_id = VALUES(user_id), created_at = CURRENT_TIMESTAMP`,
    [productId, userId ?? null, email.trim()]
  );
}
