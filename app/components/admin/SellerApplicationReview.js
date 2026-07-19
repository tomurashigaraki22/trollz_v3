"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Button from "../ui/Button";
import { updateSellerApplicationAction } from "@/app/actions/admin";

const STATUS_STYLES = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-danger/15 text-danger border-danger/30",
};

export default function SellerApplicationReview({ application }) {
  const [remarks, setRemarks] = useState(application.remarks ?? "");
  const [, startTransition] = useTransition();
  const [submittingStatus, setSubmittingStatus] = useState(null);
  const router = useRouter();

  function handleDecision(status) {
    setSubmittingStatus(status);
    startTransition(async () => {
      await updateSellerApplicationAction(application.id, { status, remarks });
      setSubmittingStatus(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-sm font-medium capitalize ${STATUS_STYLES[application.verification_status]}`}
        >
          {application.verification_status}
        </span>
        {application.verified_by && (
          <span className="text-xs text-ink-400">
            Reviewed by {application.verified_by}
            {application.verification_date &&
              ` on ${new Date(application.verification_date).toLocaleDateString()}`}
          </span>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-ink-800">Remarks</label>
        <textarea
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          rows={3}
          placeholder="Notes for the seller, especially if rejecting"
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          disabled={submittingStatus !== null}
          onClick={() => handleDecision("approved")}
        >
          {submittingStatus === "approved" ? "Saving..." : "Approve"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submittingStatus !== null}
          onClick={() => handleDecision("pending")}
        >
          Mark Pending
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-danger hover:bg-danger/10"
          disabled={submittingStatus !== null}
          onClick={() => handleDecision("rejected")}
        >
          {submittingStatus === "rejected" ? "Saving..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
