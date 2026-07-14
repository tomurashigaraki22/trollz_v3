import { query } from "@/lib/db";

// Admin write-path for the real `product`/`category` tables. Kept separate
// from lib/queries/products.js (public read-only storefront queries).

export async function getAllProductsForAdmin() {
  return query(
    "SELECT id, item, category, price, old_price, discount, qty, is_flash_sale, flash_sale_price, flash_sale_end FROM product ORDER BY date DESC"
  );
}

export async function getFlashSaleProductsForAdmin() {
  return query(
    `SELECT id, item, price, old_price, discount, is_flash_sale, flash_sale_price, flash_sale_end
     FROM product WHERE is_flash_sale = 1 ORDER BY flash_sale_end DESC`
  );
}

export async function searchProductsForAdmin(term, limit = 10) {
  const like = `%${term}%`;
  return query(
    `SELECT id, item, category, price, old_price, discount, is_flash_sale
     FROM product WHERE item LIKE ? ORDER BY item LIMIT ?`,
    [like, limit]
  );
}

export async function getAllCategoriesForAdmin() {
  const rows = await query(
    `SELECT c.id, c.category AS name, c.parent_id,
       (SELECT COUNT(*) FROM product p WHERE p.category = c.category) AS productCount
     FROM category c
     ORDER BY c.parent_id IS NULL DESC, c.id`
  );
  return rows;
}

export async function addProduct({ item, category, subcategory, price, discount, qty, description, sizeOptions, colorOptions }) {
  const oldPrice = price;
  const effectivePrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
  const sizeType = sizeOptions.length > 0 && sizeOptions.join() !== "Standard" ? "cloth" : "none";

  await query(
    `INSERT INTO product
      (item, category, subcategory, price, discount, description, category_id, supplier, new, img, qty,
       shipped_from_abroad, old_price, color_options, size_type, size_options, stock, views)
     VALUES (?, ?, ?, ?, ?, ?, 0, 'Trollz Store', 'Yes', '[]', ?, 0, ?, ?, ?, ?, 0, 0)`,
    [
      item,
      category,
      subcategory ?? "",
      effectivePrice,
      discount,
      description,
      qty,
      oldPrice,
      colorOptions.length > 0 ? JSON.stringify(colorOptions) : null,
      sizeType,
      sizeType !== "none" ? JSON.stringify(sizeOptions) : null,
    ]
  );
}

export async function updateProduct(id, { item, category, subcategory, price, discount, qty, description, sizeOptions, colorOptions }) {
  const oldPrice = price;
  const effectivePrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
  const sizeType = sizeOptions.length > 0 && sizeOptions.join() !== "Standard" ? "cloth" : "none";

  await query(
    `UPDATE product SET
      item = ?, category = ?, subcategory = ?, price = ?, discount = ?, description = ?,
      qty = ?, old_price = ?, color_options = ?, size_type = ?, size_options = ?
     WHERE id = ?`,
    [
      item,
      category,
      subcategory ?? "",
      effectivePrice,
      discount,
      description,
      qty,
      oldPrice,
      colorOptions.length > 0 ? JSON.stringify(colorOptions) : null,
      sizeType,
      sizeType !== "none" ? JSON.stringify(sizeOptions) : null,
      id,
    ]
  );
}

export async function deleteProduct(id) {
  await query("DELETE FROM product WHERE id = ?", [id]);
}

export async function addCategory({ name, parentId }) {
  await query("INSERT INTO category (category, parent_id, bg_color) VALUES (?, ?, '#ebebeb')", [
    name,
    parentId ?? null,
  ]);
}

export async function deleteCategory(id) {
  await query("DELETE FROM category WHERE id = ?", [id]);
}

export async function setProductFlashSale(id, { isFlashSale, discount, flashSaleEnd }) {
  if (!isFlashSale) {
    await query(
      "UPDATE product SET is_flash_sale = 0, flash_sale_price = NULL, flash_sale_start = NULL, flash_sale_end = NULL WHERE id = ?",
      [id]
    );
    return;
  }

  const rows = await query("SELECT old_price, price FROM product WHERE id = ? LIMIT 1", [id]);
  const basePrice = rows[0]?.old_price ?? rows[0]?.price ?? 0;
  const flashSalePrice = Math.round(basePrice * (1 - discount / 100));

  await query(
    `UPDATE product SET
      is_flash_sale = 1, discount = ?, flash_sale_price = ?, flash_sale_start = NOW(), flash_sale_end = ?
     WHERE id = ?`,
    [discount, flashSalePrice, flashSaleEnd, id]
  );
}
