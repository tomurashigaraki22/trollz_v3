"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import { updateReferralSettingsAction } from "@/app/actions/admin";

export default function AdminReferralSettingsForm({ settings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    creditValueNgn: String(settings.credit_value_ngn),
    qualifyingSpendNgn: String(settings.qualifying_spend_ngn),
    creditsAwarded: String(settings.credits_awarded),
  });
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    await updateReferralSettingsAction({
      creditValueNgn: Number(form.creditValueNgn) || 0,
      qualifyingSpendNgn: Number(form.qualifyingSpendNgn) || 0,
      creditsAwarded: Number(form.creditsAwarded) || 0,
    });
    setSubmitting(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <label className="text-sm font-medium text-ink-800">Credit value (₦ per credit)</label>
        <input
          name="creditValueNgn"
          type="number"
          min="0"
          step="0.01"
          value={form.creditValueNgn}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-ink-800">Qualifying spend (₦)</label>
        <input
          name="qualifyingSpendNgn"
          type="number"
          min="0"
          step="0.01"
          value={form.qualifyingSpendNgn}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-ink-400">
          How much an invited user must spend (paid orders) before the inviter earns credits.
        </p>
      </div>
      <div>
        <label className="text-sm font-medium text-ink-800">Credits awarded per referral</label>
        <input
          name="creditsAwarded"
          type="number"
          min="0"
          step="0.01"
          value={form.creditsAwarded}
          onChange={handleChange}
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="sm:col-span-3">
        {saved && <p className="mb-3 text-sm text-success">Settings updated.</p>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
