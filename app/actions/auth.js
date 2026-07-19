"use server";

import { getSession } from "@/lib/session";
import {
  findUserByEmail,
  verifyAndMigratePassword,
  createUser,
  createPasswordResetToken,
  resetPasswordWithToken,
} from "@/lib/queries/users";
import { findUserIdByReferralCode, setReferredBy } from "@/lib/queries/referrals";

function sanitize(user) {
  if (!user) return null;
  const { password, reset_token, token_expiry, ...safe } = user;
  return safe;
}

export async function loginAction(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    return { ok: false, error: "Incorrect email or password." };
  }

  const valid = await verifyAndMigratePassword(user, password);
  if (!valid) {
    return { ok: false, error: "Incorrect email or password." };
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return { ok: true, user: sanitize(user) };
}

export async function registerAction({ name, email, phone, password, ref }) {
  const result = await createUser({ name, email, phone, password });
  if (!result.ok) {
    return result;
  }

  if (ref) {
    const inviterId = await findUserIdByReferralCode(ref);
    if (inviterId) {
      await setReferredBy(result.id, inviterId);
    }
  }

  const session = await getSession();
  session.userId = result.id;
  await session.save();

  return {
    ok: true,
    user: { id: result.id, name, email: email.trim(), phone, role: "Customer", status: 0 },
  };
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
}

export async function requestPasswordResetAction(email) {
  const { token } = await createPasswordResetToken(email);
  // No email provider is wired up yet, so the reset link is handed straight
  // back to the caller instead of being emailed. Swap this for a real email
  // send once one is configured.
  return { ok: true, token };
}

export async function resetPasswordAction(token, newPassword) {
  return resetPasswordWithToken(token, newPassword);
}
