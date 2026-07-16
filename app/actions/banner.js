"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { requireAdmin } from "@/lib/session";
import { getBanner, setBannerImage, resetBanner } from "@/lib/queries/banner";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "banner");
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function extensionFor(mimeType) {
  return { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[
    mimeType
  ];
}

export async function uploadBannerImageAction(formData) {
  await requireAdmin();

  const slot = formData.get("slot");
  const file = formData.get("file");

  if (slot !== "desktop" && slot !== "mobile") {
    return { ok: false, error: "Invalid banner slot." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file uploaded." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Please upload a JPEG, PNG, WEBP or AVIF image." };
  }
  if (file.size > MAX_SIZE) {
    return { ok: false, error: "Image must be smaller than 5MB." };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${slot}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${extensionFor(file.type)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  const previous = await getBanner();
  const previousUrl = slot === "mobile" ? previous.mobile_image_url : previous.desktop_image_url;

  await setBannerImage(slot, `/uploads/banner/${filename}`);

  if (previousUrl?.startsWith("/uploads/banner/")) {
    await unlink(path.join(process.cwd(), "public", previousUrl)).catch(() => {});
  }

  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { ok: true };
}

export async function resetBannerAction() {
  await requireAdmin();

  const previous = await getBanner();
  for (const url of [previous.desktop_image_url, previous.mobile_image_url]) {
    if (url?.startsWith("/uploads/banner/")) {
      await unlink(path.join(process.cwd(), "public", url)).catch(() => {});
    }
  }

  await resetBanner();
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { ok: true };
}
