import { query } from "@/lib/db";

export async function subscribeToNewsletter(email) {
  await query("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)", [email.trim()]);
}

export async function getAllNewsletterSubscribers() {
  return query("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC");
}
