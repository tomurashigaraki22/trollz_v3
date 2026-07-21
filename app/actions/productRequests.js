"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireAdmin } from "@/lib/session";
import { createProductRequest, updateProductRequestStatus } from "@/lib/queries/productRequests";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "product-requests");
const STATUSES = new Set(["new", "reviewing", "sourcing", "found", "unavailable", "closed"]);

async function saveImage(file) {
  if (!file || file.size === 0) return null;
  if (!file.type?.startsWith("image/")) throw new Error("Upload an image file.");
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name || "") || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/product-requests/${filename}`;
}

export async function createProductRequestAction(_previousState, formData) {
  const user = await getCurrentUser();
  const productName = String(formData.get("productName") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const name = String(formData.get("name") || user?.name || "").trim();
  const email = String(formData.get("email") || user?.email || "").trim();
  const phone = String(formData.get("phone") || user?.phone || "").trim();

  if (!productName) return { ok: false, error: "Tell us the product name or what you are looking for." };
  if (!email || !email.includes("@")) return { ok: false, error: "Enter a valid email address." };

  try {
    const imageUrl = await saveImage(formData.get("image"));
    await createProductRequest({
      userId: user?.id,
      name,
      email,
      phone,
      productName,
      description,
      imageUrl,
    });
    revalidatePath("/admin/product-requests");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message || "Could not submit request." };
  }
}

export async function updateProductRequestAction(id, formData) {
  await requireAdmin();
  const status = String(formData.get("status") || "").trim();
  const adminNote = String(formData.get("adminNote") || "").trim();
  if (!STATUSES.has(status)) return { ok: false, error: "Invalid status." };
  await updateProductRequestStatus(id, { status, adminNote });
  revalidatePath("/admin/product-requests");
  return { ok: true };
}
