"use client";

import Image from "next/image";
import { updateProductRequestAction } from "@/app/actions/productRequests";

const STATUSES = ["new", "reviewing", "sourcing", "found", "unavailable", "closed"];

export default function ProductRequestsManager({ requests }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <table className="min-w-full divide-y divide-ink-100 text-sm">
        <thead className="bg-ink-50 text-left text-xs font-semibold uppercase text-ink-500">
          <tr>
            <th className="px-4 py-3">Request</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Admin Note</th>
            <th className="px-4 py-3">Update</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {requests.map((request) => (
            <tr key={request.id}>
              <td className="px-4 py-4 align-top">
                <div className="flex gap-3">
                  {request.image_url && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                      <Image src={request.image_url} alt={request.product_name} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-ink-900">{request.product_name}</p>
                    <p className="mt-1 max-w-xs text-xs text-ink-500">{request.description || "No details"}</p>
                    <p className="mt-1 text-xs text-ink-400">{new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 align-top text-ink-600">
                <p className="font-medium text-ink-800">{request.name || "Customer"}</p>
                <p>{request.email}</p>
                {request.phone && <p>{request.phone}</p>}
              </td>
              <td className="px-4 py-4 align-top">
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold capitalize text-brand-600">
                  {request.status}
                </span>
              </td>
              <td className="px-4 py-4 align-top text-ink-500">{request.admin_note || "-"}</td>
              <td className="px-4 py-4 align-top">
                <form action={(formData) => updateProductRequestAction(request.id, formData)} className="space-y-2">
                  <select name="status" defaultValue={request.status} className="w-full rounded-lg border border-ink-200 px-2 py-2 text-xs">
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <textarea name="adminNote" defaultValue={request.admin_note || ""} rows={2} className="w-full rounded-lg border border-ink-200 px-2 py-2 text-xs" placeholder="Note" />
                  <button type="submit" className="rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500">
                    Save
                  </button>
                </form>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-ink-500">No product requests yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
