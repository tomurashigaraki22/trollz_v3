import AdminEmailCampaignForm from "../../../components/admin/AdminEmailCampaignForm";
import { EMAIL_TEMPLATES } from "@/lib/mail/templates";

export const dynamic = "force-dynamic";

export default function AdminEmailsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Email Campaigns</h1>
        <p className="mt-1 text-sm text-ink-500">
          Send styled, personalized Gmail campaigns from trollz.mallstore@gmail.com.
        </p>
      </div>

      <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-ink-800">
        Add the Gmail app password on the server as <code>GMAIL_APP_PASSWORD</code> before sending.
      </div>

      <AdminEmailCampaignForm templates={EMAIL_TEMPLATES} />
    </div>
  );
}
