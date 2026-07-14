import { query } from "@/lib/db";

export async function subscribeToNewsletter(email) {
  await query("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)", [email.trim()]);
}
