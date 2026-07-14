"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import AddressForm from "./AddressForm";
import {
  addAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/app/actions/account";

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

export default function AddressesManager({ addresses }) {
  const [mode, setMode] = useState("list");
  const [editingId, setEditingId] = useState(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const editingAddress = addresses.find((address) => address.id === editingId);

  function handleAdd(form) {
    startTransition(async () => {
      await addAddressAction(form);
      setMode("list");
      router.refresh();
    });
  }

  function handleUpdate(form) {
    startTransition(async () => {
      await updateAddressAction(editingId, form);
      setMode("list");
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(id) {
    startTransition(async () => {
      await deleteAddressAction(id);
      router.refresh();
    });
  }

  function handleSetDefault(id) {
    startTransition(async () => {
      await setDefaultAddressAction(id);
      router.refresh();
    });
  }

  if (mode === "add") {
    return (
      <Card className="p-6">
        <h2 className="mb-5 text-base font-semibold text-ink-900">Add New Address</h2>
        <AddressForm onSubmit={handleAdd} onCancel={() => setMode("list")} />
      </Card>
    );
  }

  if (mode === "edit" && editingAddress) {
    return (
      <Card className="p-6">
        <h2 className="mb-5 text-base font-semibold text-ink-900">Edit Address</h2>
        <AddressForm
          initial={toFormShape(editingAddress)}
          onSubmit={handleUpdate}
          onCancel={() => {
            setMode("list");
            setEditingId(null);
          }}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-900">My Shipping Addresses</h2>
        <Button type="button" size="sm" onClick={() => setMode("add")}>
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-ink-500">You haven&apos;t saved any addresses yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="p-5">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-ink-900">{address.full_name}</h3>
                {Boolean(address.is_default) && (
                  <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
                    <Star className="h-3 w-3" fill="currentColor" /> Default
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-ink-600">{address.phone}</p>
              <p className="mt-1 text-sm text-ink-500">
                {address.address1}
                {address.address2 ? `, ${address.address2}` : ""}
              </p>
              <p className="text-sm text-ink-500">
                {address.city}, {address.state}, {address.country}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(address.id);
                    setMode("edit");
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                {!address.is_default && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger/10"
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
