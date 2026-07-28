import { query, withTransaction } from "@/lib/db";
import { CANCELLABLE_STATUSES } from "@/lib/orderStatus";
import { checkAndAwardReferralCredit, redeemCredits } from "@/lib/queries/referrals";
import { redeemCoupon } from "@/lib/queries/coupons";

let orderSchemaReady = false;

async function ensureOrderSchema() {
  if (orderSchemaReady) return;
  const columns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'orders'"
  );
  const existing = new Set(columns.map((row) => row.COLUMN_NAME || row.column_name));
  const additions = [
    ["coupon_code", "ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50) NULL"],
    ["coupon_discount", "ALTER TABLE orders ADD COLUMN coupon_discount DECIMAL(12,2) NOT NULL DEFAULT 0"],
    ["loyalty_points_earned", "ALTER TABLE orders ADD COLUMN loyalty_points_earned INT NOT NULL DEFAULT 0"],
  ];
  for (const [column, sql] of additions) {
    if (!existing.has(column)) await query(sql);
  }

  const itemColumns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'order_items'"
  );
  const itemExisting = new Set(itemColumns.map((row) => row.COLUMN_NAME || row.column_name));
  if (!itemExisting.has("color")) {
    await query("ALTER TABLE order_items ADD COLUMN color VARCHAR(100) NULL AFTER size");
  }

  const userColumns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users'"
  );
  const userExisting = new Set(userColumns.map((row) => row.COLUMN_NAME || row.column_name));
  if (!userExisting.has("loyalty_points")) {
    await query("ALTER TABLE users ADD COLUMN loyalty_points INT NOT NULL DEFAULT 0");
  }

  await query(
    `CREATE TABLE IF NOT EXISTS seller_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      seller_id INT,
      order_id INT NULL,
      order_number VARCHAR(100),
      buyer_name VARCHAR(255),
      buyer_email VARCHAR(255),
      total_amount DECIMAL(12,2) DEFAULT 0.00,
      order_status VARCHAR(50) DEFAULT 'pending',
      payment_status VARCHAR(50) DEFAULT 'pending',
      city VARCHAR(128),
      delivery_city VARCHAR(128),
      items TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
  const sellerOrderColumns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'seller_orders'"
  );
  const sellerOrderExisting = new Set(
    sellerOrderColumns.map((row) => row.COLUMN_NAME || row.column_name)
  );
  const sellerOrderAdditions = [
    ["order_id", "ALTER TABLE seller_orders ADD COLUMN order_id INT NULL"],
    ["items", "ALTER TABLE seller_orders ADD COLUMN items TEXT NULL"],
  ];
  for (const [column, sql] of sellerOrderAdditions) {
    if (!sellerOrderExisting.has(column)) await query(sql);
  }

  orderSchemaReady = true;
}

async function attachItems(orders) {
  if (orders.length === 0) return [];
  const ids = orders.map((order) => order.id);
  const items = await query(
    `SELECT oi.*, p.item AS current_product_name, p.category, p.subcategory, p.supplier, p.img
     FROM order_items oi
     LEFT JOIN product p ON p.id = oi.product_id
     WHERE oi.order_id IN (${ids.map(() => "?").join(",")})
     ORDER BY oi.id ASC`,
    ids
  );
  return orders.map((order) => ({
    ...order,
    items: items.filter((item) => item.order_id === order.id),
  }));
}

export async function getOrdersForUser(userId) {
  await ensureOrderSchema();
  const orders = await query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return attachItems(orders);
}

export async function getOrderById(id, userId = null) {
  await ensureOrderSchema();
  const where = userId ? "WHERE id = ? AND user_id = ?" : "WHERE id = ?";
  const params = userId ? [id, userId] : [id];
  const rows = await query(`SELECT * FROM orders ${where} LIMIT 1`, params);
  if (rows.length === 0) return null;
  const [withItems] = await attachItems(rows);
  return withItems;
}

export async function getAllOrders() {
  await ensureOrderSchema();
  const orders = await query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  return attachItems(orders);
}

export async function createPendingOrder({
  userId,
  addressId,
  addressText,
  items,
  total,
  paymentMethod,
  transactionId,
  creditsUsed = 0,
  coupon = null,
  couponDiscount = 0,
}) {
  await ensureOrderSchema();
  return withTransaction(async (run) => {
    const tracking = `TS${Date.now()}`;
    const orderResult = await run(
      `INSERT INTO orders
        (user_id, tracking, total_amount, payment_method, transaction_id, payment_status, order_status, delivery_status, address_id, address, credits_used, coupon_code, coupon_discount)
       VALUES (?, ?, ?, ?, ?, 'pending', 'pending', 'Pending', ?, ?, ?, ?, ?)`,
      [
        userId,
        tracking,
        total,
        paymentMethod,
        transactionId,
        addressId ?? null,
        addressText,
        creditsUsed,
        coupon?.code ?? null,
        couponDiscount,
      ]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await run(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, color, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.name,
          item.price,
          item.qty,
          item.size ?? "",
          item.color ?? "",
          item.price * item.qty,
        ]
      );
    }

    return { orderId, tracking };
  });
}

export async function getOrderByTransactionId(transactionId) {
  await ensureOrderSchema();
  const rows = await query("SELECT * FROM orders WHERE transaction_id = ? LIMIT 1", [transactionId]);
  if (rows.length === 0) return null;
  const [withItems] = await attachItems(rows);
  return withItems;
}

export async function getOrderByTracking(tracking) {
  await ensureOrderSchema();
  const rows = await query("SELECT * FROM orders WHERE UPPER(tracking) = UPPER(?) LIMIT 1", [
    tracking.trim(),
  ]);
  if (rows.length === 0) return null;
  const [withItems] = await attachItems(rows);
  return withItems;
}

async function syncSellerOrders(order) {
  const rows = await query(
    `SELECT
       sp.seller_id,
       oi.product_id,
       oi.product_name,
       oi.price,
       oi.quantity,
       oi.subtotal,
       oi.size,
       oi.color,
       u.name AS buyer_name,
       u.email AS buyer_email
     FROM order_items oi
     JOIN seller_products sp ON sp.storefront_product_id = oi.product_id
     JOIN users u ON u.id = ?
     WHERE oi.order_id = ?`,
    [order.user_id, order.id]
  );

  const grouped = new Map();
  for (const item of rows) {
    const current = grouped.get(item.seller_id) ?? {
      sellerId: item.seller_id,
      buyerName: item.buyer_name,
      buyerEmail: item.buyer_email,
      total: 0,
      items: [],
    };
    current.total += Number(item.subtotal || 0);
    current.items.push({
      product_id: item.product_id,
      product_name: item.product_name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      subtotal: Number(item.subtotal || 0),
      size: item.size || "",
      color: item.color || "",
    });
    grouped.set(item.seller_id, current);
  }

  for (const sellerOrder of grouped.values()) {
    const existing = await query(
      "SELECT id FROM seller_orders WHERE seller_id = ? AND order_id = ? LIMIT 1",
      [sellerOrder.sellerId, order.id]
    );
    const params = [
      order.tracking,
      sellerOrder.buyerName,
      sellerOrder.buyerEmail,
      sellerOrder.total,
      order.order_status === "pending" ? "processing" : order.order_status,
      "paid",
      order.address || "",
      order.address || "",
      JSON.stringify(sellerOrder.items),
    ];
    if (existing.length > 0) {
      await query(
        `UPDATE seller_orders
         SET order_number = ?, buyer_name = ?, buyer_email = ?, total_amount = ?,
             order_status = ?, payment_status = ?, city = ?, delivery_city = ?, items = ?
         WHERE id = ?`,
        [...params, existing[0].id]
      );
    } else {
      await query(
        `INSERT INTO seller_orders
          (seller_id, order_id, order_number, buyer_name, buyer_email, total_amount,
           order_status, payment_status, city, delivery_city, items)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [sellerOrder.sellerId, order.id, ...params]
      );
    }
  }
}

export async function markOrderPaid(transactionId) {
  await ensureOrderSchema();
  const order = await getOrderByTransactionId(transactionId);
  if (!order) return order;
  if (order.payment_status === "paid") {
    await syncSellerOrders(order);
    return order;
  }

  await withTransaction(async (run) => {
    await run(
      "UPDATE orders SET payment_status = 'paid', order_status = 'processing' WHERE transaction_id = ?",
      [transactionId]
    );
    for (const item of order.items) {
      await run("UPDATE product SET qty = GREATEST(qty - ?, 0) WHERE id = ?", [
        item.quantity,
        item.product_id,
      ]);
    }
    return order;
  });

  await redeemCredits(order.user_id, Number(order.credits_used));
  if (order.coupon_code && Number(order.coupon_discount) > 0) {
    const [coupon] = await query("SELECT id FROM coupons WHERE UPPER(code) = UPPER(?) LIMIT 1", [
      order.coupon_code,
    ]);
    if (coupon) {
      await redeemCoupon({
        couponId: coupon.id,
        userId: order.user_id,
        orderId: order.id,
        discount: Number(order.coupon_discount),
      });
    }
  }
  const loyaltyPoints = Math.floor(Number(order.total_amount) / 1000);
  if (loyaltyPoints > 0) {
    await query("UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?", [
      loyaltyPoints,
      order.user_id,
    ]);
    await query("UPDATE orders SET loyalty_points_earned = ? WHERE id = ?", [loyaltyPoints, order.id]);
  }
  await checkAndAwardReferralCredit(order.user_id);
  await syncSellerOrders({ ...order, payment_status: "paid", order_status: "processing" });

  return order;
}

export async function markOrderFailed(transactionId) {
  await ensureOrderSchema();
  await query(
    "UPDATE orders SET payment_status = 'failed', order_status = 'cancelled' WHERE transaction_id = ? AND payment_status <> 'paid'",
    [transactionId]
  );
}

export async function cancelOrder(userId, orderId) {
  await ensureOrderSchema();
  const order = await getOrderById(orderId, userId);
  if (!order || !CANCELLABLE_STATUSES.includes(order.order_status)) {
    return { ok: false, error: "This order can no longer be cancelled." };
  }
  await query("UPDATE orders SET order_status = 'cancelled' WHERE id = ? AND user_id = ?", [
    orderId,
    userId,
  ]);
  return { ok: true };
}

export async function updateOrderStatus(orderId, status) {
  await ensureOrderSchema();
  await query("UPDATE orders SET order_status = ? WHERE id = ?", [status, orderId]);
}
