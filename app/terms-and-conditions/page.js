import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";

export const metadata = {
  title: "Terms & Conditions - TrollzStore",
  description: "The rules and regulations for using the TrollzStore website.",
};

const sections = [
  {
    number: "01",
    title: "Terminology",
    body: [
      `"Client", "You" and "Your" refer to you, the person accessing this website and agreeing to the Company's terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us" refer to TrollzStore. "Party", "Parties", or "Us" refers to both the Client and ourselves.`,
    ],
  },
  {
    number: "02",
    title: "Cookies",
    body: [
      "We employ the use of cookies. By accessing TrollzStore, you agree to use cookies in agreement with our Privacy Policy.",
    ],
  },
  {
    number: "03",
    title: "License",
    body: [
      "Unless otherwise stated, TrollzStore and/or its licensors own the intellectual property rights for all material on the site. You may access this content for personal use, subject to restrictions set in these terms.",
      "You must not: republish material from TrollzStore; sell, rent, or sub-license material; reproduce, duplicate, or copy material; or redistribute content from the site.",
    ],
  },
  {
    number: "04",
    title: "User Comments",
    body: [
      "Parts of this website allow users to post and exchange opinions. TrollzStore does not filter, edit, publish, or review comments prior to posting; comments reflect the views of the person who posted them, not TrollzStore.",
      "We reserve the right to monitor and remove any comments deemed inappropriate, offensive, or in breach of these terms.",
    ],
  },
  {
    number: "05",
    title: "Hyperlinking to our Content",
    body: [
      "Government agencies, search engines, news organizations, and accredited businesses may link to our website without prior written approval, provided the link is not misleading and does not falsely imply sponsorship or endorsement.",
    ],
  },
  {
    number: "06",
    title: "iFrames",
    body: [
      "Without prior approval and written permission, you may not create frames around our webpages that alter the visual presentation or appearance of our site.",
    ],
  },
  {
    number: "07",
    title: "Content Liability",
    body: [
      "We are not responsible for content that appears on your website. You agree to protect and defend us against claims arising from your website, and no link on your site should be libelous, obscene, or infringe on any third-party rights.",
    ],
  },
  {
    number: "08",
    title: "Reservation of Rights",
    body: [
      "We reserve the right to request removal of any link to our website and to amend these terms and our linking policy at any time. Continued linking constitutes agreement to be bound by these terms.",
    ],
  },
  {
    number: "09",
    title: "Removal of Links",
    body: [
      "If you find a link on our site that is offensive for any reason, contact us. We will consider requests to remove links but are not obligated to respond directly.",
    ],
  },
  {
    number: "10",
    title: "Disclaimer",
    body: [
      "To the maximum extent permitted by law, we exclude all representations, warranties, and conditions relating to our website. Nothing in this disclaimer will limit liability for death, personal injury, or fraud, or exclude any liability that cannot be excluded under applicable law.",
      "As long as the website and its information/services are provided free of charge, we will not be liable for any loss or damage of any nature.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description={`These terms and conditions outline the rules and regulations for the use of TrollzStore's website. By accessing this website, we assume you accept these terms in full. Do not continue to use TrollzStore if you do not agree with all of the terms stated on this page.`}
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
