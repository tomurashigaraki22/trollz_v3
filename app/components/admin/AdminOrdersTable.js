"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatNaira } from "@/lib/mock/data";
import { ORDER_STATUS_STYLES, ORDER_STATUSES } from "@/lib/orderStatus";
import { updateOrderStatusAction } from "@/app/actions/admin";

function parseImage(value) {
  if (!value) return "";
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed[0] || "";
  } catch {
    return value;
  }
  return value;
}

export default function AdminOrdersTable({ orders }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [openOrderId, setOpenOrderId] = useState(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => {
    return orders
      .filter((order) => statusFilter === "all" || order.order_status === statusFilter)
      .filter((order) => {
        const term = query.trim().toLowerCase();
        if (!term) return true;
        return (
          order.tracking.toLowerCase().includes(term) ||
          order.customer_name.toLowerCase().includes(term) ||
          order.customer_email.toLowerCase().includes(term) ||
          order.items.some((item) =>
            `${item.product_name} ${item.current_product_name || ""} ${item.supplier || ""} ${item.category || ""}`
              .toLowerCase()
              .includes(term)
          )
        );
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [orders, statusFilter, query]);

  function handleStatusChange(orderId, status) {
    startTransition(async () => {
      await updateOrderStatusAction(orderId, status);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by tracking, customer name or email..."
          className="min-w-64 flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.map((order) => {
              const isOpen = openOrderId === order.id;

              return (
                <Fragment key={order.id}>
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-medium text-ink-900">{order.tracking}</td>
                    <td className="px-4 py-3">
                      <p className="text-ink-800">{order.customer_name}</p>
                      <p className="text-xs text-ink-400">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      <div className="space-y-1">
                        <p>{order.items.length}</p>
                        <p className="max-w-56 truncate text-xs text-ink-400">
                          {order.items.map((item) => item.product_name).join(", ") || "No item details"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink-900">
                      {formatNaira(order.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.order_status}
                        onChange={(event) => handleStatusChange(order.id, event.target.value)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize focus:outline-none ${ORDER_STATUS_STYLES[order.order_status]}`}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status} className="bg-white text-ink-900">
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setOpenOrderId(isOpen ? null : order.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-500 hover:text-brand-600"
                      >
                        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {isOpen ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${order.id}-details`}>
                      <td colSpan={7} className="bg-ink-50 px-4 py-5">
                        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                          <div className="rounded-xl border border-ink-100 bg-white p-4">
                            <h3 className="text-sm font-semibold text-ink-900">Products ordered</h3>
                            <div className="mt-4 space-y-3">
                              {order.items.map((item) => {
                                const image = parseImage(item.img);
                                return (
                                  <div key={item.id} className="flex gap-3 rounded-xl border border-ink-100 p-3">
                                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                                      {image ? (
                                        <img src={image} alt="" className="h-full w-full object-cover" />
                                      ) : null}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-ink-900">{item.product_name}</p>
                                      <p className="mt-1 text-xs text-ink-500">
                                        Product ID: {item.product_id}
                                        {item.supplier ? ` · Seller: ${item.supplier}` : ""}
                                        {item.category ? ` · ${item.category}` : ""}
                                      </p>
                                      {(item.size || item.color) && (
                                        <p className="mt-1 text-xs text-ink-500">
                                          {item.size ? `Size: ${item.size}` : ""}
                                          {item.size && item.color ? " · " : ""}
                                          {item.color ? `Color: ${item.color}` : ""}
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right text-sm">
                                      <p className="font-semibold text-ink-900">
                                        {item.quantity} x {formatNaira(item.price)}
                                      </p>
                                      <p className="mt-1 text-xs text-ink-500">
                                        Subtotal: {formatNaira(item.subtotal)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                              {order.items.length === 0 && (
                                <p className="text-sm text-ink-500">No item rows were stored for this order.</p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3 rounded-xl border border-ink-100 bg-white p-4 text-sm">
                            <h3 className="font-semibold text-ink-900">Order details</h3>
                            <div>
                              <p className="text-xs font-semibold uppercase text-ink-400">Payment</p>
                              <p className="mt-1 text-ink-700">
                                {order.payment_method || "N/A"} · {order.payment_status || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-ink-400">Delivery</p>
                              <p className="mt-1 text-ink-700">{order.delivery_status || order.order_status}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-ink-400">Address</p>
                              <p className="mt-1 whitespace-pre-wrap text-ink-700">{order.address || "No address saved"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-ink-400">Transaction</p>
                              <p className="mt-1 break-all text-ink-700">{order.transaction_id || "N/A"}</p>
                            </div>
                            {Number(order.coupon_discount || 0) > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase text-ink-400">Coupon</p>
                                <p className="mt-1 text-ink-700">
                                  {order.coupon_code}: -{formatNaira(order.coupon_discount)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-ink-500">
                  No orders match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
