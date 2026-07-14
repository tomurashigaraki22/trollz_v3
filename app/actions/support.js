"use server";

import { getCurrentUser } from "@/lib/session";
import { createContactMessage } from "@/lib/queries/messages";
import { createSupportMessage } from "@/lib/queries/support";
import { subscribeToNewsletter } from "@/lib/queries/newsletter";

export async function submitContactMessageAction({ name, subject, email, message }) {
  await createContactMessage({ name, subject, email, message });
  return { ok: true };
}

export async function submitSupportMessageAction({ subject, message }) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to contact support." };
  }
  await createSupportMessage({ userId: user.id, name: user.name, email: user.email, subject, message });
  return { ok: true };
}

export async function subscribeNewsletterAction(email) {
  await subscribeToNewsletter(email);
  return { ok: true };
}
