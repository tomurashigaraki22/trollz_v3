"use client";

import { useMemo, useState, useTransition } from "react";
import { Mail, Send, Users, Eye } from "lucide-react";
import { sendEmailCampaignAction, sendTestEmailCampaignAction } from "@/app/actions/admin";

export default function AdminEmailCampaignForm({ templates }) {
  const [form, setForm] = useState({
    target: "customers",
    manualEmails: "",
    templateId: templates[0]?.id ?? "announcement",
    subject: templates[0]?.subject ?? "",
    body: "We wanted to share this with you personally, {{first_name}}.\n\nWrite what the campaign is about here.",
    ctaLabel: templates[0]?.ctaLabel ?? "",
    ctaUrl: templates[0]?.ctaUrl ?? "",
  });
  const [result, setResult] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [pending, startTransition] = useTransition();
  const [testPending, startTestTransition] = useTransition();

  const template = templates.find((item) => item.id === form.templateId) ?? templates[0];

  const previewBody = useMemo(
    () =>
      form.body
        .replaceAll("{{name}}", "Ada Customer")
        .replaceAll("{{first_name}}", "Ada")
        .replaceAll("{{email}}", "ada@example.com"),
    [form.body]
  );

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function selectTemplate(id) {
    const next = templates.find((item) => item.id === id);
    setForm((current) => ({
      ...current,
      templateId: id,
      subject: next?.subject ?? current.subject,
      ctaLabel: next?.ctaLabel ?? current.ctaLabel,
      ctaUrl: next?.ctaUrl ?? current.ctaUrl,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setResult(null);
    startTransition(async () => {
      const response = await sendEmailCampaignAction(form);
      setResult(response);
    });
  }

  function handleSendTest() {
    setTestResult(null);
    startTestTransition(async () => {
      const response = await sendTestEmailCampaignAction({ ...form, testEmail });
      setTestResult(response);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-ink-900">Choose a template</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {templates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTemplate(item.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  form.templateId === item.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-ink-100 hover:border-brand-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink-900">{item.name}</p>
                  <span className="h-4 w-4 rounded-full" style={{ background: item.accent }} />
                </div>
                <p className="mt-1 text-sm leading-6 text-ink-500">{item.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-ink-900">Recipients</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["customers", "Customers"],
              ["sellers", "Sellers"],
              ["newsletter", "Newsletter"],
              ["manual", "Manual"],
            ].map(([value, label]) => (
              <label key={value} className="flex items-center gap-2 rounded-xl border border-ink-100 px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="target"
                  checked={form.target === value}
                  onChange={() => update("target", value)}
                />
                {label}
              </label>
            ))}
          </div>
          {form.target === "manual" && (
            <textarea
              value={form.manualEmails}
              onChange={(event) => update("manualEmails", event.target.value)}
              placeholder="one@email.com, two@email.com"
              rows={3}
              className="mt-4 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          )}
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-semibold text-ink-900">Message</h2>
          <p className="mt-1 text-sm text-ink-500">
            Personalize with <code>{"{{first_name}}"}</code>, <code>{"{{name}}"}</code>, or <code>{"{{email}}"}</code>.
          </p>
          <div className="mt-4 space-y-4">
            <input
              value={form.subject}
              onChange={(event) => update("subject", event.target.value)}
              placeholder="Subject"
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <textarea
              value={form.body}
              onChange={(event) => update("body", event.target.value)}
              placeholder="Write what this email is about..."
              rows={8}
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm leading-6 focus:border-brand-500 focus:outline-none"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.ctaLabel}
                onChange={(event) => update("ctaLabel", event.target.value)}
                placeholder="Button label"
                className="rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <input
                value={form.ctaUrl}
                onChange={(event) => update("ctaUrl", event.target.value)}
                placeholder="Button URL"
                className="rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {result && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              result.ok ? "border-success/30 bg-success/10 text-success" : "border-danger/30 bg-danger/10 text-danger"
            }`}
          >
            {result.ok
              ? `Sent ${result.sent} email(s). ${result.failed ? `${result.failed} failed.` : ""}`
              : result.error}
          </div>
        )}

        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-semibold text-ink-900">Test send</h2>
          <p className="mt-1 text-sm text-ink-500">
            Send this exact campaign to one email first.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              placeholder="test@example.com"
              className="min-w-0 flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <button
              type="button"
              disabled={testPending}
              onClick={handleSendTest}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-800 hover:border-brand-500 hover:text-brand-600 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {testPending ? "Sending test..." : "Send test"}
            </button>
          </div>
          {testResult && (
            <div
              className={`mt-3 rounded-xl border p-3 text-sm ${
                testResult.ok
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-danger/30 bg-danger/10 text-danger"
              }`}
            >
              {testResult.ok ? `Test email sent to ${testEmail}.` : testResult.error}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {pending ? "Sending..." : "Send email campaign"}
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-ink-100 bg-white p-5">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold text-ink-900">Preview</h2>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100">
          <div className="p-6 text-white" style={{ background: template?.accent }}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">{template?.eyebrow}</p>
            <h3 className="mt-2 text-2xl font-black leading-tight">{template?.title}</h3>
          </div>
          <div className="space-y-4 p-6 text-sm leading-7 text-ink-700">
            <p>Hi Ada,</p>
            <p className="whitespace-pre-line">{previewBody}</p>
            <span className="inline-flex rounded-full bg-brand-500 px-4 py-2 text-xs font-bold text-white">
              {form.ctaLabel || template?.ctaLabel}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
