"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Star, ShieldCheck } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import {
  addPaymentMethodAction,
  deletePaymentMethodAction,
  setDefaultPaymentMethodAction,
} from "@/app/actions/account";

const DEMO_BRANDS = ["Visa", "Mastercard", "Verve"];

export default function PaymentMethodsManager({ paymentMethods }) {
  const [adding, setAdding] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Real card capture happens on Flutterwave's hosted checkout — we never
  // see or store raw card numbers. This simulates what a saved-card
  // response from Flutterwave would look like, but writes a real row.
  function handleSimulateAdd() {
    const brand = DEMO_BRANDS[Math.floor(Math.random() * DEMO_BRANDS.length)];
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, "0");
    const year = String(26 + Math.floor(Math.random() * 4));

    startTransition(async () => {
      await addPaymentMethodAction({
        brand,
        last4,
        expiry: `${month}/${year}`,
        isDefault: paymentMethods.length === 0,
      });
      setAdding(false);
      router.refresh();
    });
  }

  function handleDelete(id) {
    startTransition(async () => {
      await deletePaymentMethodAction(id);
      router.refresh();
    });
  }

  function handleSetDefault(id) {
    startTransition(async () => {
      await setDefaultPaymentMethodAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-900">Payment Methods</h2>
        <Button type="button" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Add Payment Method
        </Button>
      </div>

      {adding && (
        <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            <p className="text-sm text-ink-600">
              For your security, card details are entered on Flutterwave&apos;s secure hosted
              checkout — we never see or store your card number. In this demo build, click below
              to simulate a card being saved.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleSimulateAdd}>
              Simulate Saved Card
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {paymentMethods.length === 0 ? (
        <p className="text-sm text-ink-500">You haven&apos;t saved any payment methods yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {paymentMethods.map((card) => (
            <Card key={card.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{card.card_brand}</p>
                  <p className="mt-1 text-sm text-ink-500">•••• •••• •••• {card.card_last4}</p>
                  <p className="text-xs text-ink-400">Expires {card.expiry}</p>
                </div>
                {Boolean(card.is_default) && (
                  <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
                    <Star className="h-3 w-3" fill="currentColor" /> Default
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {!card.is_default && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(card.id)}
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger/10"
                  onClick={() => handleDelete(card.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
