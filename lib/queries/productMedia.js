import { query } from "@/lib/db";

let schemaReady = false;

async function tableExists(table) {
  const rows = await query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1",
    [table]
  );
  return rows.length > 0;
}

async function ensureColumns(table, columns) {
  if (!(await tableExists(table))) return;
  const rows = await query(
    "SELECT column_name FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ?",
    [table]
  );
  const existing = new Set(rows.map((row) => row.COLUMN_NAME || row.column_name));
  for (const [name, definition] of columns) {
    if (existing.has(name)) continue;
    try {
      await query(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
    } catch (error) {
      if (error?.code !== "ER_DUP_FIELDNAME" && error?.errno !== 1060) throw error;
    }
  }
}

export async function ensureProductMediaSchema() {
  if (schemaReady) return;
  await ensureColumns("product", [
    ["video_url", "TEXT NULL"],
    ["video_duration", "DECIMAL(8,2) NULL"],
    ["video_mime", "VARCHAR(64) NULL"],
  ]);
  await ensureColumns("seller_products", [
    ["video_url", "TEXT NULL"],
    ["video_duration", "DECIMAL(8,2) NULL"],
    ["video_mime", "VARCHAR(64) NULL"],
  ]);
  schemaReady = true;
}
