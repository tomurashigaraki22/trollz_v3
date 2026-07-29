"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { addBannerImage, resetBanner } from "@/lib/queries/banner";

const API_BASE_URL = "https://api.trollzstore.com.ng";
const API_SECRET_KEY = "trollz_api_secret_2024_xK9mP3qR";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

async function uploadToCloudinary(file) {
  const body = new FormData();
  body.set("file", file);
  body.set("folder", "trollz/banner");

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    headers: {
      "X-API-Key": API_SECRET_KEY,
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data.error || data.message || "Could not upload banner image.");
  }
  return data.url;
}

export async function uploadBannerImageAction(formData) {
  try {
    await requireAdmin();

    const slot = formData.get("slot");
    const file = formData.get("file");

    if (slot !== "desktop" && slot !== "mobile") {
      return { ok: false, error: "Invalid banner slot." };
    }
    if (!file || file.size === 0) {
      return { ok: false, error: "No file uploaded." };
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return { ok: false, error: "Please upload a JPEG, PNG, WEBP or AVIF image." };
    }
    if (file.size > MAX_SIZE) {
      return { ok: false, error: "Image must be smaller than 5MB." };
    }

    const url = await uploadToCloudinary(file);
    await addBannerImage(slot, url);

    revalidatePath("/");
    revalidatePath("/admin/banner");
    return { ok: true, url };
  } catch (error) {
    return { ok: false, error: error.message || "Could not upload banner image." };
  }
}

export async function resetBannerAction() {
  await requireAdmin();

  await resetBanner();
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { ok: true };
}
