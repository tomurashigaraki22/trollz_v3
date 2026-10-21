"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import {
  addBannerSlide,
  removeBannerSlide,
  resetBanner,
  updateBannerSlide,
} from "@/lib/queries/banner";
import {
  BANNER_VIDEO_MAX_BYTES,
  BANNER_VIDEO_MAX_DURATION_SECONDS,
} from "@/lib/mediaLimits";

const API_BASE_URL = "https://api.trollzstore.com.ng";
const API_SECRET_KEY = "trollz_api_secret_2024_xK9mP3qR";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

async function uploadToCloudinary(file, type) {
  const body = new FormData();
  body.set("file", file);
  body.set("folder", "trollz/banner");
  body.set("media_type", type);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    headers: {
      "X-API-Key": API_SECRET_KEY,
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data.error || data.message || `Banner upload failed (${response.status}).`);
  }
  return data;
}

export async function uploadBannerMediaAction(formData) {
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

    const isVideo = VIDEO_TYPES.has(file.type);
    if (!isVideo && !IMAGE_TYPES.has(file.type)) {
      return { ok: false, error: "Use a JPEG, PNG, WEBP, AVIF, MP4 or WebM file." };
    }
    if (isVideo && file.size > BANNER_VIDEO_MAX_BYTES) {
      return { ok: false, error: "Banner videos must be smaller than 20MB." };
    }
    if (!isVideo && file.size > MAX_IMAGE_SIZE) {
      return { ok: false, error: "Banner images must be smaller than 5MB." };
    }

    const media = await uploadToCloudinary(file, isVideo ? "video" : "image");
    if (isVideo && (!media.duration || Number(media.duration) > BANNER_VIDEO_MAX_DURATION_SECONDS)) {
      return { ok: false, error: "Banner videos must be 15 seconds or shorter." };
    }

    const slide = await addBannerSlide(slot, {
      type: isVideo ? "video" : "image",
      url: media.url,
      mime: media.mime || file.type,
      duration: media.duration,
    });

    revalidatePath("/");
    revalidatePath("/admin/banner");
    return { ok: true, slide };
  } catch (error) {
    return { ok: false, error: error.message || "Could not upload banner media." };
  }
}

// Backwards-compatible action for any older client still importing the image name.
export async function uploadBannerImageAction(formData) {
  const result = await uploadBannerMediaAction(formData);
  return result.ok ? { ...result, url: result.slide.url } : result;
}

export async function updateBannerSlideAction(slot, id, button) {
  await requireAdmin();
  const slide = await updateBannerSlide(slot, id, { button });
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { ok: true, slide };
}

export async function removeBannerSlideAction(slot, id) {
  await requireAdmin();
  await removeBannerSlide(slot, id);
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { ok: true };
}

export async function resetBannerAction() {
  await requireAdmin();

  await resetBanner();
  revalidatePath("/");
  revalidatePath("/admin/banner");
  return { ok: true };
}
