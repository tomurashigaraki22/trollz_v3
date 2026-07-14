import { CreditCard, Truck, History } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import Newsletter from "../components/home/Newsletter";

export const metadata = {
  title: "About Us - TrollzStore",
  description: "Trollz Store, Nigeria's number one online retail store for home and general needs.",
};

const perks = [
  { icon: CreditCard, title: "Credit Card", description: "We accept all major cards." },
  { icon: Truck, title: "Free Shipping", description: "On selected products." },
  { icon: History, title: "24/7 Support", description: "Active customer support." },
];

const pillars = [
  {
    number: "01",
    title: "Our Mission",
    description:
      "We strive to offer our customers the lowest possible prices, the best available selection, and the utmost convenience.",
  },
  {
    number: "02",
    title: "Our Vision",
    description:
      "To be Africa's most customer-centric company, where customers can find and discover fashion trends they relate with.",
  },
  {
    number: "03",
    title: "Our Value",
    description:
      "We pride ourselves in quality products, pocket-friendly pricing, top customer relationships, and same-day delivery.",
  },
  {
    number: "04",
    title: "Our Story",
    description:
      "Founded with a passion for customer satisfaction, TrollzStore was created to bring you the best shopping experience possible — fun, easy, and rewarding.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Why Choose Us"
        title="We are known for our remarkable service"
        description={`"TrollzStore" — the number one online retail store that caters for all your home and general needs. We deliver in style, so relax and shop from the comfort of your home.`}
      />

      <Section>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {perks.map((perk) => (
            <Card key={perk.title} className="p-8 text-center">
              <perk.icon className="mx-auto h-8 w-8 text-brand-500" />
              <h3 className="mt-3 text-base font-semibold text-ink-900">{perk.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{perk.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="border-t border-ink-100">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">About Us</p>
          <h2 className="mt-2 text-2xl font-bold text-ink-900 sm:text-3xl">
            We thrive on quality, new trends and fashion
          </h2>
          <p className="mt-4 text-sm leading-6 text-ink-500">
            Your one-stop destination for all things delightful. We made a promise of lower
            prices — a promise that has formed the foundation of our business and helped us grow
            into one of Africa&apos;s largest online variety stores. Using our massive bulk buying
            power, we offer a world-class shopping experience across indoor, outdoor and general
            goods at the lowest possible prices.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div key={pillar.number}>
              <h3 className="text-sm font-semibold text-ink-900">
                <span className="text-brand-500">{pillar.number}.</span> {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-500">{pillar.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Newsletter />
    </>
  );
}
