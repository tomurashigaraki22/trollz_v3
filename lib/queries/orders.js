import { query, withTransaction } from "@/lib/db";
import { CANCELLABLE_STATUSES } from "@/lib/orderStatus";

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
  const orders = await query(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
  return attachItems(orders);
}

export async function getOrderById(id, userId = null) {
  const where = userId ? "WHERE id = ? AND user_id = ?" : "WHERE id = ?";
  const params = userId ? [id, userId] : [id];
  const rows = await query(`SELECT * FROM orders ${where} LIMIT 1`, params);
  if (rows.length === 0) return null;
  const [withItems] = await attachItems(rows);
  return withItems;
}

export async function getAllOrders() {
  const orders = await query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  return attachItems(orders);
}

export async function createOrder({ userId, addressId, addressText, items, total, paymentMethod, transactionId }) {
  return withTransaction(async (run) => {
    const tracking = `TS${Date.now()}`;
    const orderResult = await run(
      `INSERT INTO orders
        (user_id, tracking, total_amount, payment_method, transaction_id, payment_status, order_status, delivery_status, address_id, address)
       VALUES (?, ?, ?, ?, ?, 'paid', 'processing', 'Pending', ?, ?)`,
      [userId, tracking, total, paymentMethod, transactionId, addressId ?? null, addressText]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await run(
        `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.name, item.price, item.qty, item.size ?? "", item.price * item.qty]
      );
      await run("UPDATE product SET qty = GREATEST(qty - ?, 0) WHERE id = ?", [item.qty, item.productId]);
    }

    return { orderId, tracking };
  });
}

export async function cancelOrder(userId, orderId) {
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
  await query("UPDATE orders SET order_status = ? WHERE id = ?", [status, orderId]);
}
