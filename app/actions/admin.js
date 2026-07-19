"use server";

import { revalidatePath } from "next/cache";
import { getSession, requireAdmin } from "@/lib/session";
import { findUserByEmail, verifyAndMigratePassword } from "@/lib/queries/users";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  deleteCategory,
  setProductFlashSale,
  searchProductsForAdmin,
} from "@/lib/queries/admin-products";
import { updateOrderStatus } from "@/lib/queries/orders";
import { updateSupportMessageStatus, deleteSupportMessage } from "@/lib/queries/support";
import { createSeller, setSellerStatus, deleteSeller } from "@/lib/queries/sellers";
import { updateReferralSettings } from "@/lib/queries/referrals";
import { updateSellerApplicationStatus } from "@/lib/queries/sellerApplications";

export async function adminLoginAction(email, password) {
  const user = await findUserByEmail(email);
  if (!user || user.role !== "Admin") {
    return { ok: false, error: "Incorrect admin email or password." };
  }

  const valid = await verifyAndMigratePassword(user, password);
  if (!valid) {
    return { ok: false, error: "Incorrect admin email or password." };
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return { ok: true };
}

export async function adminLogoutAction() {
  const session = await getSession();
  session.destroy();
}

export async function addProductAction(product) {
  await requireAdmin();
  await addProduct(product);
  revalidatePath("/admin/products");
}

export async function updateProductAction(id, product) {
  await requireAdmin();
  await updateProduct(id, product);
  revalidatePath("/admin/products");
  revalidatePath(`/product/${id}`);
}

export async function deleteProductAction(id) {
  await requireAdmin();
  await deleteProduct(id);
  revalidatePath("/admin/products");
}

export async function addCategoryAction(category) {
  await requireAdmin();
  await addCategory(category);
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(id) {
  await requireAdmin();
  await deleteCategory(id);
  revalidatePath("/admin/categories");
}

export async function updateOrderStatusAction(orderId, status) {
  await requireAdmin();
  await updateOrderStatus(orderId, status);
  revalidatePath("/admin/orders");
}

export async function resolveSupportMessageAction(id, status) {
  await requireAdmin();
  await updateSupportMessageStatus(id, status);
  revalidatePath("/admin/support");
}

export async function deleteSupportMessageAction(id) {
  await requireAdmin();
  await deleteSupportMessage(id);
  revalidatePath("/admin/support");
}

export async function setProductFlashSaleAction(id, flashSale) {
  await requireAdmin();
  await setProductFlashSale(id, flashSale);
  revalidatePath("/admin/flash-sales");
  revalidatePath("/");
}

export async function searchProductsForFlashSaleAction(term) {
  await requireAdmin();
  if (!term.trim()) return [];
  return searchProductsForAdmin(term.trim());
}

export async function createSellerAction(seller) {
  await requireAdmin();
  const result = await createSeller(seller);
  revalidatePath("/admin/sellers");
  return result;
}

export async function setSellerStatusAction(id, status) {
  await requireAdmin();
  await setSellerStatus(id, status);
  revalidatePath("/admin/sellers");
}

export async function deleteSellerAction(id) {
  await requireAdmin();
  await deleteSeller(id);
  revalidatePath("/admin/sellers");
}

export async function updateReferralSettingsAction(settings) {
  await requireAdmin();
  await updateReferralSettings(settings);
  revalidatePath("/admin/referrals");
}

export async function updateSellerApplicationAction(id, { status, remarks }) {
  const admin = await requireAdmin();
  await updateSellerApplicationStatus(id, { status, remarks, verifiedBy: admin.name });
  revalidatePath("/admin/seller-applications");
  revalidatePath(`/admin/seller-applications/${id}`);
}
