"use client";

import { useActionState } from "react";
import { Search, Upload } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { createProductRequestAction } from "@/app/actions/productRequests";

export default function RequestProductPage() {
  const [state, formAction, pending] = useActionState(createProductRequestAction, { ok: false, error: "" });

  return (
    <>
      <PageHero
        eyebrow="Request Any Product"
        title="Can’t Find It?"
        description="Send us the name, details, or a picture. Trollz will try to source it through our seller network."
      />
      <Section>
        <Card className="mx-auto max-w-2xl p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-ink-900">Request a product</h2>
              <p className="text-sm text-ink-500">We’ll contact you if sellers can source it.</p>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <Field label="Product name or item">
              <input name="productName" required className="ts-input" placeholder="e.g. iPhone 15 Pro case, Nike slides..." />
            </Field>
            <Field label="Extra details">
              <textarea name="description" rows={4} className="ts-input min-h-28 py-3" placeholder="Color, size, budget, brand, delivery timeline..." />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Your name">
                <input name="name" className="ts-input" placeholder="Name" />
              </Field>
              <Field label="Email">
                <input name="email" type="email" required className="ts-input" placeholder="you@example.com" />
              </Field>
            </div>
            <Field label="Phone">
              <input name="phone" className="ts-input" placeholder="Optional" />
            </Field>
            <label className="block rounded-xl border border-dashed border-ink-200 p-4 text-sm text-ink-600">
              <span className="flex items-center gap-2 font-medium text-ink-800">
                <Upload className="h-4 w-4" />
                Upload a reference image
              </span>
              <input name="image" type="file" accept="image/*" className="mt-3 block w-full text-sm" />
            </label>

            {state?.error && <p className="text-sm text-danger">{state.error}</p>}
            {state?.ok && <p className="text-sm font-medium text-green-600">Request sent. We’ll review it shortly.</p>}

            <button type="submit" disabled={pending} className="rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">
              {pending ? "Sending..." : "Submit Request"}
            </button>
          </form>
        </Card>
      </Section>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-800">{label}</span>
      {children}
    </label>
  );
}
