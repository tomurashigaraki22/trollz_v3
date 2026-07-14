"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "../components/auth/AuthCard";
import Button from "../components/ui/Button";
import { requestPasswordResetAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await requestPasswordResetAction(email);
    if (result.token) {
      setResetLink(`/reset-password?token=${encodeURIComponent(result.token)}`);
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check your email" subtitle="Password reset instructions are on the way.">
        <p className="text-sm leading-6 text-ink-600">
          If an account exists for <span className="font-medium text-ink-900">{email}</span>,
          we&apos;ve sent instructions to reset your password.
        </p>
        {resetLink && (
          <p className="mt-4 rounded-lg bg-ink-50 p-3 text-xs text-ink-500">
            No email provider is configured yet, so here&apos;s the reset link directly:{" "}
            <Link href={resetLink} className="font-medium text-brand-600 hover:underline">
              Reset password →
            </Link>
          </p>
        )}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you reset instructions."
      footer={
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink-800">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <Button type="submit" className="w-full">
          Send Reset Instructions
        </Button>
      </form>
    </AuthCard>
  );
}
