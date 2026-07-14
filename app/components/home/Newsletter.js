"use client";

import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import Section from "../ui/Section";
import { subscribeNewsletterAction } from "@/app/actions/support";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    await subscribeNewsletterAction(email);
    setSubscribed(true);
    setEmail("");
  }

  return (
    <Section className="py-14 sm:py-16">
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-ink-900 px-6 py-12 text-center sm:px-12">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white">
          <Mail className="h-5 w-5" />
        </span>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Get deals before anyone else
        </h2>
        <p className="max-w-md text-sm leading-6 text-ink-400">
          Subscribe for early access to flash sales, new arrivals and
          member-only discounts.
        </p>

        {subscribed ? (
          <p className="flex items-center gap-2 text-sm font-medium text-white">
            <CheckCircle2 className="h-5 w-5 text-success" /> You&apos;re subscribed — watch your
            inbox for deals.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-md flex-col gap-3 pt-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-sm text-white placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </Section>
  );
}
