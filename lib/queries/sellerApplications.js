import { query } from "@/lib/db";

export async function getAllSellerApplications() {
  return query("SELECT * FROM seller_applications ORDER BY submitted_at DESC");
}

export async function getSellerApplicationById(id) {
  const rows = await query("SELECT * FROM seller_applications WHERE id = ? LIMIT 1", [id]);
  return rows[0] ?? null;
}

export async function updateSellerApplicationStatus(id, { status, remarks, verifiedBy }) {
  const rows = await query("SELECT * FROM seller_applications WHERE id = ? LIMIT 1", [id]);
  const application = rows[0];
  if (!application) throw new Error("Seller application not found.");
  if (status === "approved" && (Number(application.agreement_accepted) !== 1 || !String(application.signature_name || "").trim())) {
    throw new Error("This application cannot be approved until the Seller Agreement is accepted and signed.");
  }
  await query(
    "UPDATE seller_applications SET verification_status = ?, remarks = ?, verified_by = ?, verification_date = NOW() WHERE id = ?",
    [status, remarks ?? null, verifiedBy, id]
  );
  if (status === "approved" && application.seller_user_id) {
    await query("UPDATE users SET status = 1 WHERE id = ? AND role = 'Seller'", [application.seller_user_id]);
  }
}
