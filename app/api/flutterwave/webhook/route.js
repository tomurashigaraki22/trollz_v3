import { NextResponse } from "next/server";
import { verifyTransaction, verifyTransactionByReference } from "@/lib/flutterwave";
import { markOrderFailed, markOrderPaid } from "@/lib/queries/orders";

const HARD_FAILURE_STATUSES = new Set(["failed", "cancelled", "abandoned", "declined"]);

export async function POST(request) {
  const payload = await request.json().catch(() => null);
  const data = payload?.data ?? payload;
  const transactionId = data?.id || data?.transaction_id;
  const txRef = data?.tx_ref;

  if (!transactionId && !txRef) {
    return NextResponse.json({ ok: false, error: "Missing transaction reference" }, { status: 400 });
  }

  // Always re-verify against Flutterwave directly rather than trusting the
  // webhook body's own status field, which can be spoofed by anyone who
  // knows this URL.
  const verification = transactionId
    ? await verifyTransaction(transactionId)
    : await verifyTransactionByReference(txRef);
  const transaction = verification.ok ? verification.transaction : null;
  const verifiedTxRef = transaction?.tx_ref || txRef;

  if (!verifiedTxRef) {
    return NextResponse.json({ ok: true });
  }

  if (transaction?.status === "successful") {
    await markOrderPaid(verifiedTxRef);
    return NextResponse.json({ ok: true });
  }

  // Bank transfers can send an intermediate "pending" webhook before the
  // final "successful" one — only mark the order failed on a genuinely
  // terminal status, never on "pending". markOrderPaid/markOrderFailed are
  // both idempotent against an already-paid order either way.
  if (HARD_FAILURE_STATUSES.has(transaction?.status)) {
    await markOrderFailed(verifiedTxRef);
  }

  return NextResponse.json({ ok: true });
}
