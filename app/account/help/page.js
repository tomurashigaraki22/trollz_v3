"use client";

import { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../../components/auth/AuthProvider";
import { submitSupportMessageAction } from "@/app/actions/support";

const faqs = [
  {
    question: "How do I track my order?",
    answer: "Go to My Orders to see live status for every order you've placed.",
  },
  {
    question: "What is your return policy?",
    answer: "Items can be returned within 7 days of delivery if unused and in original packaging.",
  },
  {
    question: "How long does delivery take?",
    answer: "Most orders arrive within 2-5 business days depending on your location.",
  },
];

export default function HelpPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await submitSupportMessageAction(form);
    if (result.ok) {
      setSent(true);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-base font-semibold text-ink-900">Contact Support</h2>
        <p className="mt-1 text-sm text-ink-500">
          Signed in as {user?.email}. We typically respond within 24 hours.
        </p>

        {sent ? (
          <p className="mt-5 text-sm text-success">
            Your message has been sent. Our support team will reach out to {user?.email} shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-800">Subject</label>
              <input
                name="subject"
                required
                value={form.subject}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-800">Message</label>
              <textarea
                name="message"
                rows={5}
                required
                value={form.message}
                onChange={handleChange}
                className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <Button type="submit">Send Message</Button>
          </form>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-ink-900">Frequently Asked Questions</h2>
        <div className="mt-4 divide-y divide-ink-100">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-3">
              <summary className="cursor-pointer list-none text-sm font-medium text-ink-800 marker:content-['']">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm leading-6 text-ink-500">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}
