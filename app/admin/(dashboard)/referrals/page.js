import AdminReferralSettingsForm from "../../../components/admin/AdminReferralSettingsForm";
import { formatNaira } from "@/lib/mock/data";
import { getReferralSettings, getReferralLog } from "@/lib/queries/referrals";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  const [settings, log] = await Promise.all([getReferralSettings(), getReferralLog()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Referrals & Store Credit</h1>
        <p className="mt-1 text-sm text-ink-500">
          Configure how invite-a-friend store credit works across the storefront.
        </p>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <AdminReferralSettingsForm settings={settings} />
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-ink-900">Recent Credit Awards</h2>
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
              <tr>
                <th className="px-4 py-3">Inviter</th>
                <th className="px-4 py-3">Invitee</th>
                <th className="px-4 py-3">Qualifying Spend</th>
                <th className="px-4 py-3">Credits Awarded</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {log.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3">
                    <p className="text-ink-800">{entry.inviter_name}</p>
                    <p className="text-xs text-ink-400">{entry.inviter_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink-800">{entry.invitee_name}</p>
                    <p className="text-xs text-ink-400">{entry.invitee_email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{formatNaira(entry.qualifying_spend_ngn)}</td>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {Number(entry.credits_awarded).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {log.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-500">
                    No referral credits have been awarded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
