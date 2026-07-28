import { query } from "@/lib/db";
import { sendGmail } from "@/lib/mail/gmail";
import { EMAIL_TEMPLATES } from "@/lib/mail/templates";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function personalize(value, recipient) {
  const firstName = String(recipient.name || "").trim().split(/\s+/)[0] || "there";
  return String(value || "")
    .replaceAll("{{name}}", recipient.name || "there")
    .replaceAll("{{first_name}}", firstName)
    .replaceAll("{{email}}", recipient.email || "");
}

function renderTemplate({ template, recipient, subject, body, ctaLabel, ctaUrl }) {
  const safeBody = escapeHtml(personalize(body, recipient)).replace(/\n/g, "<br />");
  const title = personalize(template.title, recipient);
  const preview = personalize(subject, recipient);
  const finalCtaLabel = personalize(ctaLabel || template.ctaLabel, recipient);
  const finalCtaUrl = ctaUrl || template.ctaUrl;

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7f9;font-family:Inter,Arial,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:${template.accent};padding:28px 30px;color:#ffffff;">
                <div style="font-size:22px;font-weight:900;letter-spacing:-0.02em;">Trollz<span style="color:#ff4a1c;">Store</span></div>
                <div style="margin-top:22px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;opacity:0.82;">${escapeHtml(template.eyebrow)}</div>
                <h1 style="margin:8px 0 0;font-size:30px;line-height:1.12;letter-spacing:-0.04em;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Hi ${escapeHtml(personalize("{{first_name}}", recipient))},</p>
                <div style="font-size:15px;line-height:1.75;color:#374151;">${safeBody}</div>
                <div style="margin-top:28px;">
                  <a href="${escapeHtml(finalCtaUrl)}" style="display:inline-block;background:#ff4a1c;color:#ffffff;text-decoration:none;border-radius:999px;padding:13px 22px;font-size:14px;font-weight:800;">${escapeHtml(finalCtaLabel)}</a>
                </div>
                <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">You are receiving this from TrollzStore because you interacted with our store or subscribed to updates.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText({ recipient, body }) {
  return `Hi ${personalize("{{first_name}}", recipient)},\n\n${personalize(body, recipient)}\n\nTrollzStore`;
}

export async function getEmailRecipients(target) {
  if (target === "newsletter") {
    const rows = await query(
      "SELECT email, SUBSTRING_INDEX(email, '@', 1) AS name FROM newsletter_subscribers ORDER BY created_at DESC"
    );
    return rows;
  }

  const role = target === "sellers" ? "Seller" : "Customer";
  return query(
    "SELECT id, name, email FROM users WHERE role = ? AND email IS NOT NULL AND email <> '' ORDER BY id DESC",
    [role]
  );
}

export async function sendEmailCampaign({ target, manualEmails, templateId, subject, body, ctaLabel, ctaUrl }) {
  const template = EMAIL_TEMPLATES.find((item) => item.id === templateId) ?? EMAIL_TEMPLATES[0];
  const recipients =
    target === "manual"
      ? manualEmails
          .split(/[\n,;]/)
          .map((email) => email.trim())
          .filter(Boolean)
          .map((email) => ({ email, name: email.split("@")[0] }))
      : await getEmailRecipients(target);

  const unique = Array.from(new Map(recipients.map((r) => [String(r.email).toLowerCase(), r])).values());
  const results = { sent: 0, failed: 0, errors: [] };

  for (const recipient of unique) {
    try {
      const personalizedSubject = personalize(subject || template.subject, recipient);
      await sendGmail({
        to: recipient.email,
        subject: personalizedSubject,
        html: renderTemplate({ template, recipient, subject: personalizedSubject, body, ctaLabel, ctaUrl }),
        text: renderText({ recipient, body }),
      });
      results.sent += 1;
    } catch (error) {
      results.failed += 1;
      results.errors.push(`${recipient.email}: ${error.message}`);
    }
  }

  return results;
}
