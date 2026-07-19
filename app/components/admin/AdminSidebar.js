"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  Headset,
  Zap,
  LogOut,
  ExternalLink,
  Store,
  Image as ImageIcon,
  Gift,
  ShieldCheck,
} from "lucide-react";
import { adminLogoutAction } from "@/app/actions/admin";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/flash-sales", label: "Flash Sales", icon: Zap },
  { href: "/admin/referrals", label: "Referrals & Credit", icon: Gift },
  { href: "/admin/sellers", label: "Sellers", icon: Store },
  { href: "/admin/seller-applications", label: "Seller Applications", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/banner", label: "Homepage Banner", icon: ImageIcon },
  { href: "/admin/support", label: "Support Inbox", icon: Headset },
];

export default function AdminSidebar({ admin }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await adminLogoutAction();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-ink-900 text-ink-300">
      <div className="border-b border-white/10 px-5 py-5">
        <span className="text-lg font-extrabold tracking-tight text-white">
          Trollz<span className="text-brand-500">Admin</span>
        </span>
        <p className="mt-1 truncate text-xs text-ink-500">{admin?.email}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? "bg-brand-500 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-300 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
          View Store
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-danger hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
