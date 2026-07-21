"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { upsertProductReview } from "@/lib/queries/reviews";

export async function submitProductReviewAction(productId, formData) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Please log in to review this product." };
  }

  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") || "").trim();
  const comment = String(formData.get("comment") || "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Choose a rating from 1 to 5 stars." };
  }
  if (comment.length < 8) {
    return { ok: false, error: "Write a short review before submitting." };
  }

  await upsertProductReview({
    productId: Number(productId),
    userId: user.id,
    name: user.name,
    rating,
    title,
    comment,
  });

  revalidatePath(`/product/${productId}`);
  return { ok: true };
}
