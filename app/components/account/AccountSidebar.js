"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  PackageSearch,
  MapPin,
  CreditCard,
  Settings,
  Headset,
  LogOut,
  Gift,
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

const links = [
  { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "My Orders", icon: PackageSearch },
  { href: "/account/addresses", label: "Shipping Addresses", icon: MapPin },
  { href: "/account/payment-methods", label: "Payment Methods", icon: CreditCard },
  { href: "/account/referrals", label: "Invite & Earn", icon: Gift },
  { href: "/account/settings", label: "Settings", icon: Settings },
  { href: "/account/help", label: "Help & Support", icon: Headset },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <aside className="rounded-2xl border border-ink-100 p-4">
      <div className="border-b border-ink-100 px-2 pb-4">
        <p className="text-sm font-semibold text-ink-900">{user?.name}</p>
        <p className="truncate text-xs text-ink-500">{user?.email}</p>
      </div>
      <nav className="mt-3 space-y-1">
        {links.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-brand-50 font-medium text-brand-600"
                  : "text-ink-600 hover:bg-ink-50"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-danger hover:bg-ink-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
