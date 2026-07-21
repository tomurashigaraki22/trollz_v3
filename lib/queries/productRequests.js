import { query } from "@/lib/db";

let productRequestTableReady = false;

export async function ensureProductRequestTable() {
  if (productRequestTableReady) return;
  await query(`
    CREATE TABLE IF NOT EXISTS product_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      name VARCHAR(255) NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(80) NULL,
      product_name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      image_url TEXT NULL,
      status ENUM('new','reviewing','sourcing','found','unavailable','closed') NOT NULL DEFAULT 'new',
      admin_note TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX product_requests_status_idx (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  productRequestTableReady = true;
}

export async function createProductRequest(data) {
  await ensureProductRequestTable();
  const result = await query(
    `INSERT INTO product_requests
      (user_id, name, email, phone, product_name, description, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.userId ?? null,
      data.name,
      data.email,
      data.phone,
      data.productName,
      data.description,
      data.imageUrl,
    ]
  );
  return result.insertId;
}

export async function getProductRequests() {
  await ensureProductRequestTable();
  return query("SELECT * FROM product_requests ORDER BY created_at DESC");
}

export async function updateProductRequestStatus(id, { status, adminNote }) {
  await ensureProductRequestTable();
  await query("UPDATE product_requests SET status = ?, admin_note = ? WHERE id = ?", [
    status,
    adminNote,
    id,
  ]);
}
