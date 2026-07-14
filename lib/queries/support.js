import { query } from "@/lib/db";

export async function createSupportMessage({ userId, name, email, subject, message }) {
  await query(
    "INSERT INTO support_messages (user_id, name, email, subject, message, status) VALUES (?, ?, ?, ?, ?, 'open')",
    [userId ?? null, name, email, subject, message]
  );
}

export async function getAllSupportMessages() {
  return query("SELECT * FROM support_messages ORDER BY created_at DESC");
}

export async function updateSupportMessageStatus(id, status) {
  await query("UPDATE support_messages SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteSupportMessage(id) {
  await query("DELETE FROM support_messages WHERE id = ?", [id]);
}
