import "server-only";

// Hardcoded per explicit instruction (not read from env), matching the same
// pattern already used for the DB credentials in lib/db.js. The secret key
// must only ever be used server-side (Server Actions / route handlers) —
// never expose FLW_SECRET_KEY to client code. Rotate both keys in the
// Flutterwave dashboard if this repo is ever made public or shared beyond
// the team.
export const FLW_PUBLIC_KEY = "FLWPUBK-9dfb0a099633cdea36091144c4ab90a1-X";
const FLW_SECRET_KEY = "FLWSECK-a06a4c6127b87fd2a6b0d68cf12283bb-19d1f239ad3vt-X";
const FLW_BASE_URL = "https://api.flutterwave.com/v3";

export async function initializePayment({ txRef, amount, email, name, phone, redirectUrl }) {
  const response = await fetch(`${FLW_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${FLW_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      currency: "NGN",
      redirect_url: redirectUrl,
      customer: { email, name, phonenumber: phone },
      customizations: {
        title: "TrollzStore",
        description: "Payment for items in cart",
      },
    }),
  });

  const data = await response.json();
  if (!response.ok || data.status !== "success") {
    return { ok: false, error: data.message || "Could not start payment. Please try again." };
  }

  return { ok: true, link: data.data.link };
}

export async function verifyTransaction(transactionId) {
  const response = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` },
  });

  const data = await response.json();
  if (!response.ok || data.status !== "success") {
    return { ok: false, error: data.message || "Could not verify payment." };
  }

  return { ok: true, transaction: data.data };
}
