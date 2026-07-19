"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function InviteLinkCard({ link }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4 flex items-center gap-2">
      <input
        readOnly
        value={link}
        onFocus={(event) => event.target.select()}
        className="flex-1 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2.5 text-sm text-ink-700"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
