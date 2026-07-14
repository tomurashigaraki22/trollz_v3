"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, Mail } from "lucide-react";
import Button from "../ui/Button";
import { resolveSupportMessageAction, deleteSupportMessageAction } from "@/app/actions/admin";

const STATUS_STYLES = {
  open: "border-warning/30 bg-warning/15 text-warning",
  replied: "border-info/30 bg-info/15 text-info",
  closed: "border-success/30 bg-success/15 text-success",
};

export default function AdminSupportInbox({ messages }) {
  const [filter, setFilter] = useState("open");
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = messages.filter((message) =>
    filter === "all" ? true : message.status === filter
  );

  function handleStatusChange(id, status) {
    startTransition(async () => {
      await resolveSupportMessageAction(id, status);
      router.refresh();
    });
  }

  function handleDelete(id) {
    startTransition(async () => {
      await deleteSupportMessageAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink-900">Support Inbox</h1>
        <div className="flex gap-2">
          {["open", "replied", "closed", "all"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === option
                  ? "bg-brand-500 text-white"
                  : "bg-white text-ink-600 hover:bg-ink-100"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-500">No messages here.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((message) => (
            <div key={message.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{message.subject}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                    <Mail className="h-3.5 w-3.5" /> {message.name} · {message.email}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[message.status]}`}
                >
                  {message.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-600">{message.message}</p>
              <p className="mt-2 text-xs text-ink-400">
                {new Date(message.created_at).toLocaleString()}
              </p>

              <div className="mt-4 flex gap-2">
                {message.status !== "replied" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(message.id, "replied")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Replied
                  </Button>
                )}
                {message.status !== "closed" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(message.id, "closed")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Closed
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger/10"
                  onClick={() => handleDelete(message.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
