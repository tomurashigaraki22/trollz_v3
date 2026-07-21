"use client";

import { useActionState } from "react";
import { Bell } from "lucide-react";
import { requestRestockNotificationAction } from "@/app/actions/restock";

export default function RestockNotificationForm({ productId, userEmail }) {
  const [state, formAction, pending] = useActionState(
    async (_previous, formData) => requestRestockNotificationAction(productId, formData),
    { ok: false, error: "" }
  );

  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Bell className="h-4 w-4 text-brand-500" />
        Get restock alert
      </div>
      <form action={formAction} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          defaultValue={userEmail ?? ""}
          placeholder="Email address"
          className="min-w-0 flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Notify me"}
        </button>
      </form>
      {state?.error && <p className="mt-2 text-sm text-danger">{state.error}</p>}
      {state?.ok && <p className="mt-2 text-sm font-medium text-green-600">We will email you when it is back.</p>}
    </div>
  );
}
