import "server-only";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { query } from "@/lib/db";

// Hardcoded per project decision (no env vars). Must stay in sync across
// deploys — rotating it invalidates all existing sessions.
const SESSION_PASSWORD = "Tr0llzSt0re-Session-Secret-2026-VeryLongRandomKey!!";

const sessionOptions = {
  password: SESSION_PASSWORD,
  cookieName: "trollz_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession(cookieStore, sessionOptions);
}

function sanitizeUser(row) {
  if (!row) return null;
  const { password, reset_token, token_expiry, ...safe } = row;
  return safe;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;

  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [session.userId]);
  if (rows.length === 0) return null;
  return sanitizeUser(rows[0]);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const error = new Error("Not authenticated");
    error.status = 401;
    throw error;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "Admin") {
    const error = new Error("Not authorized");
    error.status = 403;
    throw error;
  }
  return user;
}
