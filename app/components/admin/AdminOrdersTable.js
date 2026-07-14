"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatNaira } from "@/lib/mock/data";
import { ORDER_STATUS_STYLES, ORDER_STATUSES } from "@/lib/orderStatus";
import { updateOrderStatusAction } from "@/app/actions/admin";

export default function AdminOrdersTable({ orders }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
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
          order.customer_email.toLowerCase().includes(term)
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
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {filtered.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{order.tracking}</td>
                <td className="px-4 py-3">
                  <p className="text-ink-800">{order.customer_name}</p>
                  <p className="text-xs text-ink-400">{order.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-ink-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-ink-500">{order.items.length}</td>
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
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-500">
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
