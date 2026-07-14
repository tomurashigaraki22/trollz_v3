import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query } from "@/lib/db";

const BCRYPT_PREFIX = /^\$2[aby]\$/;

function isBcryptHash(value) {
  return typeof value === "string" && BCRYPT_PREFIX.test(value);
}

export async function findUserByEmail(email) {
  const rows = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email.trim()]);
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  return rows[0] ?? null;
}

// Legacy accounts were saved with a mix of bcrypt hashes and, for a large
// number of real rows, plain-text passwords. On successful login with a
// plaintext match, we immediately rehash to bcrypt and overwrite the stored
// value — closing the hole silently without disrupting the customer.
export async function verifyAndMigratePassword(user, plainPassword) {
  if (isBcryptHash(user.password)) {
    return bcrypt.compare(plainPassword, user.password);
  }

  const matches = user.password === plainPassword;
  if (matches) {
    const newHash = await bcrypt.hash(plainPassword, 10);
    await query("UPDATE users SET password = ? WHERE id = ?", [newHash, user.id]);
  }
  return matches;
}

export async function createUser({ name, email, phone, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await query(
    "INSERT INTO users (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, 'Customer', 0)",
    [name, email.trim(), phone, hash]
  );

  return { ok: true, id: result.insertId };
}

export async function updateUserProfile(id, { name, email, phone }) {
  await query("UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?", [
    name,
    email.trim(),
    phone,
    id,
  ]);
}

export async function changeUserPassword(user, currentPassword, newPassword) {
  const valid = await verifyAndMigratePassword(user, currentPassword);
  if (!valid) {
    return { ok: false, error: "Current password is incorrect." };
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await query("UPDATE users SET password = ? WHERE id = ?", [hash, user.id]);
  return { ok: true };
}

export async function createPasswordResetToken(email) {
  const user = await findUserByEmail(email);
  if (!user) {
    // Don't reveal whether the email exists.
    return { ok: true, token: null };
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await query("UPDATE users SET reset_token = ?, token_expiry = ? WHERE id = ?", [
    token,
    expiry,
    user.id,
  ]);
  return { ok: true, token };
}

export async function resetPasswordWithToken(token, newPassword) {
  const rows = await query(
    "SELECT * FROM users WHERE reset_token = ? AND token_expiry > NOW() LIMIT 1",
    [token]
  );
  if (rows.length === 0) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await query("UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?", [
    hash,
    rows[0].id,
  ]);
  return { ok: true };
}

export async function getAllCustomers() {
  return query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.status,
       (SELECT COUNT(*) FROM user_addresses a WHERE a.user_id = u.id) AS address_count,
       (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count
     FROM users u
     WHERE u.role = 'Customer'
     ORDER BY u.id DESC`
  );
}
