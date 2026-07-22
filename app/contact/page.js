import { MapPin, Mail, Phone, Clock } from "lucide-react";
import PageHero from "../components/ui/PageHero";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import ContactForm from "../components/contact/ContactForm";
import { InstagramIcon, TikTokIcon, XIcon } from "../components/ui/SocialIcons";

export const metadata = {
  title: "Contact Us - TrollzStore",
  description: "Get in touch with the TrollzStore team.",
};

const infoItems = [
  { icon: MapPin, title: "Address", value: "Owerri, Nigeria" },
  { icon: Mail, title: "Email Us", value: "support@trollzstore.com.ng", href: "mailto:support@trollzstore.com.ng" },
  { icon: Phone, title: "Phone Number", value: "+234 816 001 5883", href: "tel:+2348160015883" },
  { icon: Clock, title: "Working Hours", value: "Mon - Fri: 9AM - 5PM" },
];

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/trollzmallstorelimited?igsh=dzQ2anRuZ3E2dmIw&utm_source=qr", icon: InstagramIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@official_trollz_store?_r=1&_t=ZS-98EaLKk0kVd", icon: TikTokIcon },
  { label: "X", href: "https://x.com/trollzstore?s=11", icon: XIcon },
];

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact Us" title="We'd love to hear from you" />
      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          <Card className="h-fit p-6">
            <h2 className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
              Contact Info
            </h2>
            <p className="mt-1 mb-6 text-lg font-bold text-ink-900">We are here to help you</p>

            <div className="space-y-5">
              {infoItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-ink-500 hover:text-brand-600">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-ink-500">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-ink-100 pt-6">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-ink-600 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
