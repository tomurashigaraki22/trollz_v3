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

  const userColumns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users'"
  );
  const userExisting = new Set(userColumns.map((row) => row.COLUMN_NAME || row.column_name));
  if (!userExisting.has("loyalty_points")) {
    await query("ALTER TABLE users ADD COLUMN loyalty_points INT NOT NULL DEFAULT 0");
  }

  orderSchemaReady = true;
}

async function attachItems(orders) {
  if (orders.length === 0) return [];
  const ids = orders.map((order) => order.id);
  const items = await query(
    `SELECT * FROM order_items WHERE order_id IN (${ids.map(() => "?").join(",")})`,
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
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.name, item.price, item.qty, item.size ?? "", item.price * item.qty]
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

export async function markOrderPaid(transactionId) {
  await ensureOrderSchema();
  const order = await getOrderByTransactionId(transactionId);
  if (!order || order.payment_status === "paid") return order;

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

  return order;
}

export async function markOrderFailed(transactionId) {
  await ensureOrderSchema();
  await query(
    "UPDATE orders SET payment_status = 'failed', order_status = 'cancelled' WHERE transaction_id = ?",
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
