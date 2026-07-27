import { query } from "@/lib/db";

let messageTableReady = false;

async function ensureMessageTable() {
  if (messageTableReady) return;
  const columns = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'message'"
  );
  const existing = new Set(columns.map((row) => row.COLUMN_NAME || row.column_name));
  if (!existing.has("status")) {
    await query("ALTER TABLE message ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'new'");
  }
  messageTableReady = true;
}

// The public Contact page form maps to the legacy `message` table
// (name, subject, email, message, date) — distinct from `support_messages`,
// which is used by the logged-in account Help & Support page.
export async function createContactMessage({ name, subject, email, message }) {
  await ensureMessageTable();
  await query(
    "INSERT INTO message (name, subject, email, message, date, status) VALUES (?, ?, ?, ?, NOW(), 'new')",
    [name, subject, email, message]
  );
}

export async function getAllContactMessages() {
  await ensureMessageTable();
  return query("SELECT * FROM message ORDER BY id DESC");
}

export async function updateContactMessageStatus(id, status) {
  await ensureMessageTable();
  await query("UPDATE message SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteContactMessage(id) {
  await ensureMessageTable();
  await query("DELETE FROM message WHERE id = ?", [id]);
}
