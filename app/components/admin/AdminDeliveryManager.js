"use client";

import { useState, useTransition } from "react";
import { saveDeliveryZoneAction } from "@/app/actions/admin";

const emptyZone = {
  id: "",
  name: "",
  state: "",
  cities: "",
  baseFee: 0,
  expressFee: 0,
  extraSellerFee: 0,
  interZoneFee: 0,
  batchDiscount: 0,
  freeThreshold: 0,
  standardMinDays: 1,
  standardMaxDays: 3,
  expressMinDays: 0,
  expressMaxDays: 1,
  isActive: true,
};

function toFormZone(zone) {
  return {
    id: zone.id ?? "",
    name: zone.name ?? "",
    state: zone.state ?? "",
    cities: zone.cities ?? "",
    baseFee: Number(zone.base_fee ?? 0),
    expressFee: Number(zone.express_fee ?? 0),
    extraSellerFee: Number(zone.extra_seller_fee ?? 0),
    interZoneFee: Number(zone.inter_zone_fee ?? 0),
    batchDiscount: Number(zone.batch_discount ?? 0),
    freeThreshold: Number(zone.free_delivery_threshold ?? 0),
    standardMinDays: Number(zone.standard_min_days ?? 1),
    standardMaxDays: Number(zone.standard_max_days ?? 3),
    expressMinDays: Number(zone.express_min_days ?? 0),
    expressMaxDays: Number(zone.express_max_days ?? 1),
    isActive: Boolean(zone.is_active),
  };
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block text-xs font-semibold text-ink-600">
      {label}
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(name, type === "number" ? Number(event.target.value) : event.target.value)}
        className="mt-1 block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-normal text-ink-900 focus:border-brand-500 focus:outline-none"
      />
    </label>
  );
}

export default function AdminDeliveryManager({ zones }) {
  const [form, setForm] = useState(emptyZone);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveDeliveryZoneAction(formData);
      setMessage(result.ok ? "Delivery zone saved." : result.error);
      if (result.ok) setForm(emptyZone);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={handleSubmit} className="h-fit rounded-2xl border border-ink-100 bg-white p-5">
        <h2 className="font-semibold text-ink-900">{form.id ? "Edit zone" : "Add delivery zone"}</h2>
        <input type="hidden" name="id" value={form.id} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Zone name" name="name" value={form.name} onChange={update} />
          <Field label="State" name="state" value={form.state} onChange={update} />
          <label className="block text-xs font-semibold text-ink-600 sm:col-span-2">
            Cities / keywords
            <textarea
              name="cities"
              value={form.cities}
              onChange={(event) => update("cities", event.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-ink-200 px-3 py-2 text-sm font-normal text-ink-900 focus:border-brand-500 focus:outline-none"
            />
          </label>
          <Field label="Standard base fee" name="baseFee" value={form.baseFee} onChange={update} type="number" />
          <Field label="Express fee" name="expressFee" value={form.expressFee} onChange={update} type="number" />
          <Field label="Extra seller fee" name="extraSellerFee" value={form.extraSellerFee} onChange={update} type="number" />
          <Field label="Inter-zone fee" name="interZoneFee" value={form.interZoneFee} onChange={update} type="number" />
          <Field label="Batch discount" name="batchDiscount" value={form.batchDiscount} onChange={update} type="number" />
          <Field label="Free threshold" name="freeThreshold" value={form.freeThreshold} onChange={update} type="number" />
          <Field label="Standard min days" name="standardMinDays" value={form.standardMinDays} onChange={update} type="number" />
          <Field label="Standard max days" name="standardMaxDays" value={form.standardMaxDays} onChange={update} type="number" />
          <Field label="Express min days" name="expressMinDays" value={form.expressMinDays} onChange={update} type="number" />
          <Field label="Express max days" name="expressMaxDays" value={form.expressMaxDays} onChange={update} type="number" />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-ink-700">
          <input
            name="isActive"
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => update("isActive", event.target.checked)}
            className="accent-brand-500"
          />
          Active at checkout
        </label>
        {message && <p className="mt-3 text-sm text-ink-500">{message}</p>}
        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save zone"}
          </button>
          <button
            type="button"
            onClick={() => setForm(emptyZone)}
            className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:border-brand-500 hover:text-brand-600"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-ink-50 text-xs font-semibold uppercase text-ink-400">
            <tr>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">Standard</th>
              <th className="px-4 py-3">Express</th>
              <th className="px-4 py-3">Extra seller</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {zones.map((zone) => (
              <tr key={zone.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{zone.name}</p>
                  <p className="text-xs text-ink-500">{zone.cities}</p>
                </td>
                <td className="px-4 py-3">NGN {Number(zone.base_fee).toLocaleString()}</td>
                <td className="px-4 py-3">NGN {Number(zone.express_fee).toLocaleString()}</td>
                <td className="px-4 py-3">NGN {Number(zone.extra_seller_fee).toLocaleString()}</td>
                <td className="px-4 py-3">-NGN {Number(zone.batch_discount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {zone.standard_min_days}-{zone.standard_max_days} days
                </td>
                <td className="px-4 py-3">{zone.is_active ? "Active" : "Inactive"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setForm(toFormZone(zone))}
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
