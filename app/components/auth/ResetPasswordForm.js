"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "./AuthCard";
import Button from "../ui/Button";
import { resetPasswordAction } from "@/app/actions/auth";

export default function ResetPasswordForm({ token = "" }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const result = await resetPasswordAction(token, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (!token) {
    return (
      <AuthCard title="Invalid reset link" subtitle="This password reset link is missing or malformed.">
        <p className="text-sm text-ink-600">
          Request a new one from the{" "}
          <a href="/forgot-password" className="font-medium text-brand-600 hover:underline">
            forgot password
          </a>{" "}
          page.
        </p>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="Redirecting you to login...">
        <p className="text-sm text-ink-600">
          Your password has been reset. You can now log in with your new password.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="text-sm font-medium text-ink-800">
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-ink-800">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full">
          Reset Password
        </Button>
      </form>
    </AuthCard>
  );
}
