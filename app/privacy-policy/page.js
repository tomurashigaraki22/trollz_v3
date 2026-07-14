import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";

export const metadata = {
  title: "Privacy Policy - TrollzStore",
  description: "How TrollzStore collects, uses and protects your personal information.",
};

const sections = [
  {
    number: "01",
    title: "Information We Collect",
    body: [
      "We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, participate in activities on the website, or otherwise contact us.",
      "The personal information we collect depends on the context of your interactions with us, the choices you make, and the products and features you use. It may include: name, email address, and phone number; payment data necessary to process purchases (such as your payment instrument details); and social media login data if you choose to register that way.",
    ],
  },
  {
    number: "02",
    title: "How We Use Your Information",
    body: [
      "We use personal information collected via our website for legitimate business purposes, to perform a contract with you, with your consent, and/or to comply with legal obligations — including to facilitate account creation, post testimonials, request feedback, manage user accounts, send administrative information, protect our services, enforce our terms, respond to legal requests, deliver services, respond to inquiries, and send marketing communications.",
    ],
  },
  {
    number: "03",
    title: "Sharing Your Information",
    body: [
      "We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations — including consent, legitimate interests, performance of a contract, legal obligations, and vital interests (such as investigating fraud or safety threats).",
    ],
  },
  {
    number: "04",
    title: "Cookies and Other Tracking Technologies",
    body: [
      "We may use cookies and similar tracking technologies to access or store information. Specific details on how we use these technologies, and how you can decline certain cookies, are set out in our Cookie Policy.",
    ],
  },
  {
    number: "05",
    title: "Data Retention",
    body: [
      "We keep your personal information only as long as necessary for the purposes set out in this notice, unless a longer retention period is required by law (such as tax or accounting requirements).",
    ],
  },
  {
    number: "06",
    title: "Your Privacy Rights",
    body: [
      "In some regions you have rights that give you greater access to and control over your personal information. You may review, change, or terminate your account at any time; upon request, we will deactivate or delete your account from our active databases, subject to limited retention for fraud prevention, troubleshooting, and legal compliance.",
    ],
  },
  {
    number: "07",
    title: "Updates to This Policy",
    body: [
      "We may update this privacy notice from time to time to reflect changes to our practices or for other operational, legal, or regulatory reasons.",
    ],
  },
  {
    number: "08",
    title: "Contact Us",
    body: [
      "If you have questions or comments about this notice, email us at trollz.mallstore@gmail.com or write to TrollzStore Customer Care.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="Welcome to TrollzStore. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this notice, please contact us at trollz.mallstore@gmail.com."
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
