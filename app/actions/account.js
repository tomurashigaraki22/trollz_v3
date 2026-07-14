"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { updateUserProfile, changeUserPassword } from "@/lib/queries/users";
import * as addressQueries from "@/lib/queries/addresses";
import * as paymentQueries from "@/lib/queries/paymentMethods";

export async function updateProfileAction(profile) {
  const user = await requireUser();
  await updateUserProfile(user.id, profile);
  revalidatePath("/account/settings");
  return { ok: true };
}

export async function changePasswordAction(currentPassword, newPassword) {
  const user = await requireUser();
  return changeUserPassword(user, currentPassword, newPassword);
}

export async function addAddressAction(address) {
  const user = await requireUser();
  await addressQueries.addAddress(user.id, address);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function updateAddressAction(id, address) {
  const user = await requireUser();
  await addressQueries.updateAddress(user.id, id, address);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function deleteAddressAction(id) {
  const user = await requireUser();
  await addressQueries.deleteAddress(user.id, id);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function setDefaultAddressAction(id) {
  const user = await requireUser();
  await addressQueries.setDefaultAddress(user.id, id);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function addPaymentMethodAction(card) {
  const user = await requireUser();
  await paymentQueries.addPaymentMethod(user.id, card);
  revalidatePath("/account/payment-methods");
}

export async function deletePaymentMethodAction(id) {
  const user = await requireUser();
  await paymentQueries.deletePaymentMethod(user.id, id);
  revalidatePath("/account/payment-methods");
}

export async function setDefaultPaymentMethodAction(id) {
  const user = await requireUser();
  await paymentQueries.setDefaultPaymentMethod(user.id, id);
  revalidatePath("/account/payment-methods");
}
