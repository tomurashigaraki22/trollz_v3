import Link from "next/link";
import SellerApplicationReview from "../../../../components/admin/SellerApplicationReview";
import { getSellerApplicationById } from "@/lib/queries/sellerApplications";
import { formatNaira } from "@/lib/mock/data";
import { SELLER_SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

function Row({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:gap-3">
      <span className="w-56 shrink-0 text-ink-500">{label}</span>
      <span className="text-ink-900">{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6">
      <h2 className="mb-1 text-base font-semibold text-ink-900">{title}</h2>
      <div className="divide-y divide-ink-50">{children}</div>
    </div>
  );
}

function docUrl(path) {
  if (!path) return null;
  return `${SELLER_SITE_URL}${path}`;
}

export default async function SellerApplicationDetailPage({ params }) {
  const { id } = await params;
  const application = await getSellerApplicationById(id);

  if (!application) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-ink-900">Application not found</h1>
        <Link href="/admin/seller-applications" className="text-sm font-medium text-brand-600 hover:underline">
          Back to applications
        </Link>
      </div>
    );
  }

  const productPhotos = application.product_photos_urls
    ? JSON.parse(application.product_photos_urls)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/seller-applications" className="text-sm font-medium text-brand-600 hover:underline">
          ← Back to applications
        </Link>
        <h1 className="mt-2 text-xl font-bold text-ink-900">{application.business_name}</h1>
        <p className="text-sm text-ink-500">Submitted by {application.full_name}</p>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <SellerApplicationReview application={application} />
      </div>

      <Section title="Personal Information">
        <Row label="Full Name" value={application.full_name} />
        <Row
          label="Date of Birth"
          value={application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : null}
        />
        <Row label="Phone" value={application.phone} />
        <Row label="Email" value={application.email} />
        <Row label="Residential Address" value={application.residential_address} />
        <Row label="State" value={application.state} />
        <Row label="Country" value={application.country} />
      </Section>

      <Section title="Business Information">
        <Row label="Business Name" value={application.business_name} />
        <Row label="Business Type" value={application.business_type} />
        <Row label="CAC Number" value={application.cac_number} />
        <Row label="Years in Business" value={application.years_in_business} />
        <Row label="Website" value={application.website} />
        <Row label="Social Handles" value={application.social_handles} />
      </Section>

      <Section title="Product Information">
        <Row label="Primary Category" value={application.primary_category} />
        <Row label="Other Categories" value={application.other_categories} />
        <Row label="Estimated Number of Products" value={application.estimated_products} />
        <Row
          label="Average Price Range"
          value={
            application.price_range_min || application.price_range_max
              ? `${formatNaira(application.price_range_min ?? 0)} - ${formatNaira(application.price_range_max ?? 0)}`
              : null
          }
        />
        <Row label="Sells only authentic products" value={application.sells_authentic ? "Yes" : "No"} />
        <Row label="Can maintain stock consistently" value={application.can_maintain_stock ? "Yes" : "No"} />
      </Section>

      <Section title="Order Fulfilment">
        <Row label="Average processing time" value={application.processing_time} />
        <Row label="Delivery coverage" value={application.delivery_coverage} />
        <Row label="Logistics partners" value={application.logistics_partners} />
      </Section>

      <Section title="Payment Information">
        <Row label="Account Name" value={application.bank_account_name} />
        <Row label="Bank Name" value={application.bank_name} />
        <Row label="Account Number" value={application.bank_account_number} />
      </Section>

      <Section title="Emergency Contact">
        <Row label="Full Name" value={application.emergency_contact_name} />
        <Row label="Relationship" value={application.emergency_contact_relationship} />
        <Row label="Phone Number" value={application.emergency_contact_phone} />
      </Section>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-ink-900">Identity Verification Documents</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            ["ID Document", application.id_document_url],
            ["Selfie with ID", application.selfie_with_id_url],
            ["CAC Certificate", application.cac_certificate_url],
            ["Proof of Address", application.proof_of_address_url],
            ["Business Logo", application.business_logo_url],
          ].map(([label, path]) =>
            path ? (
              <a
                key={label}
                href={docUrl(path)}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-ink-100 p-3 text-center text-sm font-medium text-brand-600 hover:bg-ink-50"
              >
                {label} ↗
              </a>
            ) : null
          )}
          {productPhotos.map((path, index) => (
            <a
              key={path}
              href={docUrl(path)}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-ink-100 p-3 text-center text-sm font-medium text-brand-600 hover:bg-ink-50"
            >
              Product Photo {index + 1} ↗
            </a>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500">
        Agreement accepted: {application.agreement_accepted ? "Yes" : "No"} — signed as &quot;
        {application.signature_name}&quot; on {new Date(application.submitted_at).toLocaleString()}.
      </div>
    </div>
  );
}
