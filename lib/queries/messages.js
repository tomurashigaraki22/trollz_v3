import { query } from "@/lib/db";

// The public Contact page form maps to the legacy `message` table
// (name, subject, email, message, date) — distinct from `support_messages`,
// which is used by the logged-in account Help & Support page.
export async function createContactMessage({ name, subject, email, message }) {
  await query("INSERT INTO message (name, subject, email, message, date) VALUES (?, ?, ?, ?, NOW())", [
    name,
    subject,
    email,
    message,
  ]);
}
