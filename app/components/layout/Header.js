"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search, User, Heart, ShoppingCart, LogOut, PackageSearch, GitCompare } from "lucide-react";
import Container from "../ui/Container";
import { navLinks } from "@/lib/mock/data";
import { useAuth } from "../auth/AuthProvider";
import { useCart } from "../cart/CartProvider";
import { useWishlist } from "../wishlist/WishlistProvider";
import { useCompare } from "../compare/CompareProvider";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { status, user, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    setAccountOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="text-xl font-extrabold tracking-tight text-ink-900">
            Trollz<span className="text-brand-500">Store</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-500"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/request-product"
            className="text-sm font-medium text-ink-600 transition-colors hover:text-brand-500"
          >
            Request Product
          </Link>
        </nav>

        <form action="/search" className="hidden max-w-sm flex-1 items-center md:flex">
          <div className="flex w-full items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-4 py-2">
            <Search className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              type="search"
              name="hsearch"
              placeholder="Search products..."
              className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
            />
          </div>
        </form>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 md:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>
          {status === "authenticated" && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-label="Account menu"
                aria-expanded={accountOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100 text-sm font-semibold text-ink-800 hover:bg-ink-200"
              >
                {user.name?.[0]?.toUpperCase() ?? <User className="h-5 w-5" />}
              </button>
              {accountOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-ink-100 bg-white py-2 shadow-lg"
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  <p className="truncate px-4 py-1.5 text-xs text-ink-400">{user.email}</p>
                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-ink-700 hover:bg-ink-50"
                  >
                    <PackageSearch className="h-4 w-4" /> My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-ink-50"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100"
            >
              <User className="h-5 w-5" />
            </Link>
          )}
          <Link
            href="/compare"
            aria-label="Compare products"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 sm:flex"
          >
            <GitCompare className="h-5 w-5" />
            {compareCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                {compareCount > 9 ? "9+" : compareCount}
              </span>
            )}
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100 sm:flex"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                {wishlistCount > 9 ? "9+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-100"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </Container>

      {menuOpen && (
        <nav className="border-t border-ink-100 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/request-product"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
            >
              Request Product
            </Link>
          </Container>
        </nav>
      )}
    </header>
  );
}
