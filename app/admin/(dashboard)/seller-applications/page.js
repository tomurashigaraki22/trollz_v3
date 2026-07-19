import Link from "next/link";
import { getAllSellerApplications } from "@/lib/queries/sellerApplications";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  pending: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-danger/15 text-danger border-danger/30",
};

export default async function SellerApplicationsPage() {
  const applications = await getAllSellerApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-900">Seller Applications</h1>
        <p className="mt-1 text-sm text-ink-500">
          Review and verify seller onboarding submissions.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-400 uppercase">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {applications.map((application) => (
              <tr key={application.id}>
                <td className="px-4 py-3 font-medium text-ink-900">{application.business_name}</td>
                <td className="px-4 py-3">
                  <p className="text-ink-800">{application.full_name}</p>
                  <p className="text-xs text-ink-400">{application.email}</p>
                </td>
                <td className="px-4 py-3 text-ink-500">{application.primary_category}</td>
                <td className="px-4 py-3 text-ink-500">
                  {new Date(application.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[application.verification_status]}`}
                  >
                    {application.verification_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/seller-applications/${application.id}`}
                    className="text-sm font-medium text-brand-600 hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-ink-500">
                  No seller applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
