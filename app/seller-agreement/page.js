import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";

export const metadata = {
  title: "Seller Agreement - TrollzStore",
  description: "The terms every seller agrees to when listing and selling on TrollzStore.",
};

const sections = [
  {
    number: "01",
    title: "Acceptance of Agreement",
    body: [
      `This Seller Agreement ("Agreement") is between Trollz Store ("Trollz Store", "we", "us") and the individual or business ("Seller", "you") applying to sell on the Trollz Store marketplace. By submitting a Seller Onboarding & Verification Form, listing a product, or accepting an order through Trollz Store, you agree to be bound by this Agreement, the Seller Terms & Conditions, and Trollz Store's Marketplace Policies.`,
      "This Agreement applies in addition to — not instead of — the information you provide in the Seller Onboarding & Verification Form. Where the two conflict, this Agreement governs.",
    ],
  },
  {
    number: "02",
    title: "Seller Account & Verification",
    body: [
      "Access to sell on Trollz Store is granted only after your onboarding application (personal information, business information, product information, and identity verification documents) has been reviewed and approved by the Trollz Store team.",
      "You are responsible for keeping your account information, bank details, and product listings accurate and up to date. Trollz Store may request re-verification at any time, and may suspend a seller account pending review of new or updated documentation.",
    ],
  },
  {
    number: "03",
    title: "Commission Structure & Fees",
    body: [
      "Trollz Store charges a commission on each completed sale, deducted from the order total before payout. The commission rate is set out in your seller dashboard and may vary by product category; Trollz Store will give at least 14 days' notice before any change to standing commission rates takes effect for existing listings.",
      "Payment processing fees charged by our payment partner (currently Flutterwave) are separate from the Trollz Store commission and are likewise deducted before payout.",
      "Trollz Store reserves the right to run promotional periods (including flash sales) at a discounted price point; commission is calculated on the actual sale price, not the pre-discount price.",
    ],
  },
  {
    number: "04",
    title: "Payment Timelines & Payouts",
    body: [
      "Payouts are released to the bank account on file only after an order has been marked delivered (or after the applicable return window has closed, whichever is later), to account for possible returns or disputes.",
      "Standard payout cycles run weekly. Trollz Store may withhold or delay a payout where an order is under dispute, flagged for suspected fraud, or subject to an open customer complaint, until the matter is resolved.",
      "Sellers are responsible for ensuring their bank account details are correct; Trollz Store is not liable for payouts sent to an incorrect account supplied by the seller.",
    ],
  },
  {
    number: "05",
    title: "Returns, Refunds & Cancellations",
    body: [
      "Sellers must accept returns and process refunds in line with Trollz Store's published Returns & Refunds policy shown to customers at checkout. A seller may not impose stricter return terms than the platform policy without Trollz Store's written approval.",
      "Where a return is due to a seller error (wrong item, defective product, inaccurate listing), the seller bears the cost of return shipping and the refund. Where a return is a change of mind by the customer within an eligible window, costs are apportioned per the platform's standard policy.",
      "Sellers must respond to return or refund requests within the service-level windows set out in Section 07 of this Agreement.",
    ],
  },
  {
    number: "06",
    title: "Prohibited Products & Listings",
    body: [
      "You may only list products you are legally entitled to sell, that are authentic (not counterfeit or replica), and that are accurately described, priced, and photographed.",
      "The following are strictly prohibited on Trollz Store: counterfeit or replica goods; stolen goods; weapons, ammunition, and explosives; illegal drugs and drug paraphernalia; live animals; hazardous or regulated chemicals; prescription medication without valid licensing; adult content; items infringing third-party intellectual property; and any product illegal under Nigerian law.",
      "Trollz Store may remove a listing, cancel an order, or suspend a seller account immediately and without prior notice where a prohibited or suspected-counterfeit product is identified.",
    ],
  },
  {
    number: "07",
    title: "Service-Level Expectations",
    body: [
      "Sellers must process and dispatch orders within the processing time stated on their onboarding application (Same Day, 24 Hours, 48 Hours, or 3–5 Days) and must keep listed stock quantities accurate to avoid accepting orders they cannot fulfil.",
      "Sellers must respond to customer messages and Trollz Store support inquiries within 24 hours during business days.",
      "Repeated failure to fulfil orders, ship within the stated window, or respond to customers may result in a lower search ranking for the seller's listings, a temporary suspension, or termination under Section 10.",
    ],
  },
  {
    number: "08",
    title: "Intellectual Property",
    body: [
      "Sellers retain ownership of their own product photography, descriptions, and brand assets, but grant Trollz Store a non-exclusive, royalty-free license to use, reproduce, and display this content on the Trollz Store platform and in Trollz Store marketing (including social media and email) for as long as the listing remains active.",
      "Sellers must not upload content that infringes another party's copyright, trademark, or other intellectual property rights. Trollz Store will remove infringing content upon a valid notice and may suspend repeat infringers.",
      "The Trollz Store name, logo, and platform branding remain the exclusive property of Trollz Store and may not be used by sellers without prior written permission.",
    ],
  },
  {
    number: "09",
    title: "Data Privacy & Confidentiality",
    body: [
      "Sellers may only use customer data (names, addresses, phone numbers, order details) obtained through Trollz Store for the purpose of fulfilling that customer's order. Using customer data for marketing, resale, or any other purpose is strictly prohibited.",
      "Sellers must keep customer and business data secure and must notify Trollz Store promptly if they become aware of any unauthorized access to or disclosure of customer data.",
      "Trollz Store handles seller personal and business data (including identity documents submitted during onboarding) in accordance with its Privacy Policy, and will not share seller verification documents with third parties except where required by law or to process payouts.",
    ],
  },
  {
    number: "10",
    title: "Account Suspension & Termination",
    body: [
      "Trollz Store may suspend or terminate a seller account, with or without notice, for: fraud or attempted fraud; sale of counterfeit, stolen, or prohibited items; repeated failure to fulfil orders; misleading or inaccurate listings; abusive conduct toward customers or staff; or breach of any part of this Agreement.",
      "Where possible, Trollz Store will provide written notice of the reason for suspension and a reasonable opportunity to respond before permanent termination, except in cases of suspected fraud, counterfeit goods, or conduct that poses immediate risk to customers, where immediate suspension may apply.",
      "A seller may close their account at any time by giving 14 days' written notice, provided all pending orders have been fulfilled and no disputes remain open.",
    ],
  },
  {
    number: "11",
    title: "Dispute Resolution",
    body: [
      "Disputes between a seller and a customer arising from an order should first be raised through Trollz Store's support channel, which will attempt to mediate a resolution in line with platform policy.",
      "Disputes between a seller and Trollz Store under this Agreement should first be raised in writing to Trollz Store support and will be addressed in good faith within 14 business days.",
      "If a dispute cannot be resolved through good-faith negotiation within 30 days, either party may pursue mediation, and failing that, resolution through the courts of the Federal Republic of Nigeria, which shall have exclusive jurisdiction.",
    ],
  },
  {
    number: "12",
    title: "Indemnification & Limitation of Liability",
    body: [
      "Sellers agree to indemnify and hold Trollz Store harmless from any claims, damages, or losses arising from their products, listings, or conduct, including claims of counterfeit goods, product defects, or inaccurate listings.",
      "To the maximum extent permitted by law, Trollz Store's liability to any seller arising from this Agreement is limited to the commission fees paid by that seller in the three months preceding the claim.",
    ],
  },
  {
    number: "13",
    title: "Amendments",
    body: [
      "Trollz Store may update this Agreement, the Seller Terms & Conditions, or Marketplace Policies from time to time. Material changes will be communicated to sellers with at least 14 days' notice through the seller dashboard or registered email. Continued use of the platform after that notice period constitutes acceptance of the updated terms.",
    ],
  },
  {
    number: "14",
    title: "Governing Law & Contact",
    body: [
      "This Agreement is governed by the laws of the Federal Republic of Nigeria.",
      "Questions about this Agreement can be directed to the Trollz Store seller support team through the seller dashboard or the Contact page on trollzstore.com.ng.",
    ],
  },
];

export default function SellerAgreementPage() {
  return (
    <>
      <PageHero
        eyebrow="Sellers"
        title="Seller Agreement"
        description="The terms every seller agrees to when listing and selling on Trollz Store, covering commissions, payouts, returns, prohibited products, service levels, and more."
      />
      <Section>
        <div className="mx-auto max-w-4xl space-y-10">
          {sections.map((section) => (
            <div key={section.number}>
              <h2 className="text-base font-semibold text-ink-900">
                <span className="text-brand-500">{section.number}.</span> {section.title}
              </h2>
              {section.body.map((paragraph, index) => (
                <p key={index} className="mt-3 text-sm leading-6 text-ink-500">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
