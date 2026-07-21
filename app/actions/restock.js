"use server";

import { getCurrentUser } from "@/lib/session";
import { createRestockNotification } from "@/lib/queries/restockNotifications";

export async function requestRestockNotificationAction(productId, formData) {
  const user = await getCurrentUser();
  const email = String(formData.get("email") || user?.email || "").trim();

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  await createRestockNotification({
    productId: Number(productId),
    userId: user?.id ?? null,
    email,
  });

  return { ok: true };
}
