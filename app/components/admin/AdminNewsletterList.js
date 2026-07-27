"use client";

import { Download } from "lucide-react";
import Button from "../ui/Button";

export default function AdminNewsletterList({ subscribers }) {
  function handleExport() {
    const header = "email,subscribed_at\n";
    const rows = subscribers
      .map((s) => `${s.email},${new Date(s.created_at).toISOString()}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Newsletter Subscribers</h1>
          <p className="mt-1 text-sm text-ink-500">{subscribers.length} subscribed emails.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleExport} disabled={subscribers.length === 0}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{subscriber.email}</td>
                <td className="px-4 py-3 text-ink-500">
                  {new Date(subscriber.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-sm text-ink-500">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
