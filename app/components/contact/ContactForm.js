"use client";

import { useState } from "react";
import Button from "../ui/Button";
import { submitContactMessageAction } from "@/app/actions/support";

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await submitContactMessageAction(form);
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-ink-100 bg-brand-50 p-8 text-center">
        <h3 className="text-lg font-semibold text-ink-900">Message sent</h3>
        <p className="mt-2 text-sm text-ink-600">
          Thanks for reaching out — our support team will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="text-sm font-medium text-ink-800">
          Full Name <span className="text-danger">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink-800">
          Email Address <span className="text-danger">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="subject" className="text-sm font-medium text-ink-800">
          Subject <span className="text-danger">*</span>
        </label>
        <input
          id="subject"
          name="subject"
          required
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="text-sm font-medium text-ink-800">
          Message <span className="text-danger">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="Message"
          className="mt-2 block w-full rounded-lg border border-ink-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Send Message</Button>
      </div>
    </form>
  );
}
