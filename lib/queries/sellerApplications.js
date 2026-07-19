import { query } from "@/lib/db";

export async function getAllSellerApplications() {
  return query("SELECT * FROM seller_applications ORDER BY submitted_at DESC");
}

export async function getSellerApplicationById(id) {
  const rows = await query("SELECT * FROM seller_applications WHERE id = ? LIMIT 1", [id]);
  return rows[0] ?? null;
}

export async function updateSellerApplicationStatus(id, { status, remarks, verifiedBy }) {
  await query(
    "UPDATE seller_applications SET verification_status = ?, remarks = ?, verified_by = ?, verification_date = NOW() WHERE id = ?",
    [status, remarks ?? null, verifiedBy, id]
  );
}
