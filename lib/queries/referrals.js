import { query } from "@/lib/db";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode() {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function ensureReferralCode(userId) {
  const rows = await query("SELECT referral_code FROM users WHERE id = ? LIMIT 1", [userId]);
  if (rows[0]?.referral_code) return rows[0].referral_code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    try {
      await query("UPDATE users SET referral_code = ? WHERE id = ?", [code, userId]);
      return code;
    } catch (error) {
      if (error.code !== "ER_DUP_ENTRY") throw error;
    }
  }
  throw new Error("Could not generate a unique referral code.");
}

export async function findUserIdByReferralCode(code) {
  // Case-insensitive and whitespace-tolerant — a code typed in by hand
  // (rather than autofilled from the invite link) shouldn't silently fail
  // to match just because of casing.
  const rows = await query("SELECT id FROM users WHERE UPPER(referral_code) = UPPER(?) LIMIT 1", [
    code.trim(),
  ]);
  return rows[0]?.id ?? null;
}

export async function setReferredBy(userId, inviterId) {
  if (userId === inviterId) return;
  await query("UPDATE users SET referred_by = ? WHERE id = ? AND referred_by IS NULL", [
    inviterId,
    userId,
  ]);
}

export async function getReferralSettings() {
  const rows = await query("SELECT * FROM referral_settings WHERE id = 1 LIMIT 1");
  return rows[0];
}

export async function updateReferralSettings({ creditValueNgn, qualifyingSpendNgn, creditsAwarded }) {
  await query(
    "UPDATE referral_settings SET credit_value_ngn = ?, qualifying_spend_ngn = ?, credits_awarded = ? WHERE id = 1",
    [creditValueNgn, qualifyingSpendNgn, creditsAwarded]
  );
}

export async function getUserCredits(userId) {
  const rows = await query("SELECT credits FROM users WHERE id = ? LIMIT 1", [userId]);
  return Number(rows[0]?.credits ?? 0);
}

export async function getReferralStats(userId) {
  const rows = await query(
    "SELECT COUNT(*) AS referral_count, COALESCE(SUM(credits_awarded), 0) AS credits_earned FROM referral_credit_log WHERE inviter_id = ?",
    [userId]
  );
  return {
    referralCount: Number(rows[0].referral_count),
    creditsEarned: Number(rows[0].credits_earned),
  };
}

// Called after an order is confirmed paid. Awards the inviter once the
// invitee's cumulative paid spend crosses the configured threshold —
// idempotent via the UNIQUE KEY on invitee_id in referral_credit_log, so a
// user can only ever trigger one award for their inviter.
export async function checkAndAwardReferralCredit(inviteeUserId) {
  const [user] = await query("SELECT referred_by FROM users WHERE id = ? LIMIT 1", [inviteeUserId]);
  if (!user?.referred_by) return;

  const [existing] = await query(
    "SELECT id FROM referral_credit_log WHERE invitee_id = ? LIMIT 1",
    [inviteeUserId]
  );
  if (existing) return;

  const [{ total_spend }] = await query(
    "SELECT COALESCE(SUM(total_amount), 0) AS total_spend FROM orders WHERE user_id = ? AND payment_status = 'paid'",
    [inviteeUserId]
  );

  const settings = await getReferralSettings();
  if (Number(total_spend) < Number(settings.qualifying_spend_ngn)) return;

  const result = await query(
    "INSERT IGNORE INTO referral_credit_log (inviter_id, invitee_id, credits_awarded, qualifying_spend_ngn) VALUES (?, ?, ?, ?)",
    [user.referred_by, inviteeUserId, settings.credits_awarded, settings.qualifying_spend_ngn]
  );
  if (result.affectedRows > 0) {
    await query("UPDATE users SET credits = credits + ? WHERE id = ?", [
      settings.credits_awarded,
      user.referred_by,
    ]);
  }
}

export async function getReferralLog(limit = 50) {
  return query(
    `SELECT l.*, inviter.name AS inviter_name, inviter.email AS inviter_email,
       invitee.name AS invitee_name, invitee.email AS invitee_email
     FROM referral_credit_log l
     JOIN users inviter ON inviter.id = l.inviter_id
     JOIN users invitee ON invitee.id = l.invitee_id
     ORDER BY l.created_at DESC
     LIMIT ?`,
    [limit]
  );
}

// Best-effort: if the balance has already been spent elsewhere (e.g. two
// pending orders both claimed credits before either was paid), the order
// still completes — we just don't deduct below zero.
export async function redeemCredits(userId, creditsToRedeem) {
  if (creditsToRedeem <= 0) return true;
  const result = await query(
    "UPDATE users SET credits = credits - ? WHERE id = ? AND credits >= ?",
    [creditsToRedeem, userId, creditsToRedeem]
  );
  return result.affectedRows > 0;
}
