import { NextResponse } from "next/server";
import { verifyTransaction, verifyTransactionByReference } from "@/lib/flutterwave";
import { markOrderFailed, markOrderPaid } from "@/lib/queries/orders";

export async function POST(request) {
  const payload = await request.json().catch(() => null);
  const data = payload?.data ?? payload;
  const transactionId = data?.id || data?.transaction_id;
  const txRef = data?.tx_ref;

  if (!transactionId && !txRef) {
    return NextResponse.json({ ok: false, error: "Missing transaction reference" }, { status: 400 });
  }

  const verification = transactionId
    ? await verifyTransaction(transactionId)
    : await verifyTransactionByReference(txRef);
  const transaction = verification.ok ? verification.transaction : null;
  const verifiedTxRef = transaction?.tx_ref || txRef;

  if (transaction?.status === "successful" && verifiedTxRef) {
    await markOrderPaid(verifiedTxRef);
    return NextResponse.json({ ok: true });
  }

  if (verifiedTxRef) await markOrderFailed(verifiedTxRef);
  return NextResponse.json({ ok: true });
}
