"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import Section from "../ui/Section";
import Card from "../ui/Card";
import Button from "../ui/Button";
import AddressForm from "../account/AddressForm";
import { formatNaira } from "@/lib/mock/data";
import { useCart } from "../cart/CartProvider";
import { addAddressAction } from "@/app/actions/account";
import { placeOrderAction } from "@/app/actions/orders";

function toFormShape(address) {
  return {
    fullName: address.full_name,
    phone: address.phone,
    address1: address.address1,
    address2: address.address2 ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postal_code ?? "",
    country: address.country,
    isDefault: Boolean(address.is_default),
  };
}

function addressToText(address) {
  return [address.address1, address.address2, address.city, address.state, address.country]
    .filter(Boolean)
    .join(", ");
}

export default function CheckoutClient({ user, addresses }) {
  const router = useRouter();
  const { lines, subtotal, shippingFee, total, itemCount, clearCart } = useCart();

  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((address) => address.is_default)?.id ?? addresses[0]?.id ?? null
  );
  const [addingNew, setAddingNew] = useState(addresses.length === 0);
  const [newAddress, setNewAddress] = useState(null);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const shippingAddress = useMemo(() => {
    if (addingNew) return newAddress;
    const address = addresses.find((entry) => entry.id === selectedAddressId);
    return address ? toFormShape(address) : null;
  }, [addingNew, newAddress, addresses, selectedAddressId]);

  async function handleNewAddressSubmit(form) {
    setNewAddress(form);
    if (saveNewAddress) {
      await addAddressAction(form);
    }
    setAddingNew(false);
  }

  async function handlePayNow() {
    if (!shippingAddress) return;
    setSubmitting(true);

    // Simulates redirecting to Flutterwave's hosted checkout and waiting for
    // the payment callback — replaced with a real Flutterwave Standard/
    // Inline integration + server-side transaction verification in a later
    // phase. We deliberately never touch raw card data here or in that
    // future pass. The order itself is a real row from this point on.
    setTimeout(async () => {
      const { tracking } = await placeOrderAction({
        addressId: !addingNew ? selectedAddressId : null,
        addressText: addressToText(shippingAddress),
        items: lines.map((line) => ({
          productId: line.product.id,
          name: line.product.item,
          qty: line.qty,
          price: line.unitPrice,
        })),
        total,
      });

      await clearCart();
      const query = new URLSearchParams({
        tracking,
        total: String(total),
        items: String(itemCount),
      });
      router.push(`/order-confirmation?${query.toString()}`);
    }, 1400);
  }

  if (lines.length === 0) {
    return (
      <Section>
        <div className="mx-auto max-w-md py-10 text-center">
          <p className="text-sm text-ink-500">
            Your cart is empty — add something before checking out.
          </p>
          <Button href="/shop" className="mt-6">
            Continue Shopping
          </Button>
        </div>
      </Section>
    );
  }

  if (!user) {
    return (
      <Section>
        <div className="mx-auto max-w-md py-10 text-center">
          <p className="text-sm text-ink-500">
            Your cart is saved — sign in or create an account to complete checkout.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button href="/login">Log In</Button>
            <Button href="/register" variant="outline">
              Create Account
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">Shipping Address</h2>

            {!addingNew && addresses.length > 0 && (
              <div className="mt-4 space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition-colors ${
                      selectedAddressId === address.id
                        ? "border-brand-500 bg-brand-50/40"
                        : "border-ink-200 hover:border-ink-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1 accent-brand-500"
                    />
                    <div>
                      <p className="font-medium text-ink-900">{address.full_name}</p>
                      <p className="text-ink-500">{address.phone}</p>
                      <p className="text-ink-500">
                        {address.address1}
                        {address.address2 ? `, ${address.address2}` : ""}, {address.city},{" "}
                        {address.state}, {address.country}
                      </p>
                    </div>
                  </label>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setAddingNew(true)}>
                  Use a different address
                </Button>
              </div>
            )}

            {addingNew && (
              <div className="mt-4">
                <AddressForm
                  onSubmit={handleNewAddressSubmit}
                  onCancel={addresses.length > 0 ? () => setAddingNew(false) : undefined}
                />
                <label className="mt-3 flex items-center gap-2 text-sm text-ink-600">
                  <input
                    type="checkbox"
                    checked={saveNewAddress}
                    onChange={(event) => setSaveNewAddress(event.target.checked)}
                    className="h-4 w-4 rounded border-ink-300 accent-brand-500"
                  />
                  Save this address to my account
                </label>
              </div>
            )}

            {!addingNew && newAddress && (
              <p className="mt-3 text-sm text-success">
                Using new address for {newAddress.fullName}.
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">Order Items</h2>
            <div className="mt-4 divide-y divide-ink-100">
              {lines.map((line) => (
                <div key={line.lineId} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-ink-700">
                    {line.product.item} × {line.qty}
                  </span>
                  <span className="font-medium text-ink-900">{formatNaira(line.lineTotal)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="h-fit p-6">
          <h2 className="text-base font-semibold text-ink-900">Payment</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-600">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? "Free" : formatNaira(shippingFee)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-ink-100 pt-4 text-base font-bold text-ink-900">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-6 w-full"
            disabled={!shippingAddress || submitting}
            onClick={handlePayNow}
          >
            <Lock className="h-4 w-4" />
            {submitting ? "Redirecting to Flutterwave..." : "Pay with Flutterwave"}
          </Button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout, card details never touch our
            servers
          </p>
        </Card>
      </div>
    </Section>
  );
}
