import Link from "next/link";
import Container from "../ui/Container";
import { FacebookIcon, InstagramIcon, XIcon } from "../ui/SocialIcons";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Flash Deals", href: "/shop?tab=flash" },
      { label: "Categories", href: "/shop" },
      { label: "New Arrivals", href: "/shop?sort=newest" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help & Support", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
      { label: "Seller Agreement", href: "/seller-agreement" },
    ],
  },
];

const socials = [
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "Instagram", href: "#", icon: InstagramIcon },
  { label: "X", href: "#", icon: XIcon },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-100 bg-ink-900 text-ink-300">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
              Trollz<span className="text-brand-500">Store</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-ink-400">
              Your everyday general merchandise store — authentic products,
              fast delivery, secure checkout.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-ink-300 transition-colors hover:bg-brand-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-ink-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} TrollzStore. All rights reserved.</p>
          <p>Secure payments powered by Flutterwave</p>
        </div>
      </Container>
    </footer>
  );
}
