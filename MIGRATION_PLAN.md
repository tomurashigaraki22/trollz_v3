# Trollz Store — PHP → Next.js Migration & Redesign Plan

Source: `trollz_php` (legacy, mysqli/Bootstrap 5 site)
Target: `trollz_v3` (Next.js 16 / React 19 / Tailwind v4)

Stack decisions locked in:
- **DB**: keep MySQL (`trollzstorecom_tr0llz_db`), access via `mysql2` (raw driver, no ORM)
- **Payments**: Flutterwave (hosted checkout, replaces the custom card-tokenization flow)
- **Images**: keep Cloudinary, served via `next/image` remote loader
- **Scope**: storefront first, admin dashboard rebuilt in later phases, same Next.js app
- **Design**: full redesign, same brand color (`#fe4c1c` orange + supporting neutrals), proper e-commerce layout/positioning — inspired by https://trollz-mallstore-landing-page.vercel.app/ (hero → category cards → value props → product grid → newsletter → footer)

Each phase below should ship as its own PR/commit set, be independently testable, and leave the app in a working state.

---

## Phase 0 — Foundation & Tooling

**Goal:** Project skeleton ready for real development.

- [ ] Add `mysql2` and a small `lib/db.js` connection-pool helper (env-based config, no hardcoded credentials — current `admin/db.php` has plaintext prod credentials, **do not port them into a committed file**)
- [ ] Set up `.env.local` / `.env.example` for: DB host/user/pass/name, Cloudinary cloud name + API key/secret, Flutterwave public/secret keys, session secret
- [ ] Install Tailwind v4 theme tokens matching brand palette (extract exact hexes from `assets/css/extracss.css` / `theme.min.css` — primary `#fe4c1c`, plus grays/success/danger already used: `#28a745`, `#dc3545`, `#007bff`, `#ffc107`)
- [ ] Decide on component/icon library: replace Line Awesome + Bootstrap Icons with `lucide-react` (or similar) since Bootstrap is being dropped
- [ ] Set up base layout primitives: `Container`, `Section`, `Button`, `Card` in `app/components/ui/`
- [ ] Confirm dev DB access (either a copy/dump of `trollzstorecom_tr0llz_db`, or a local MySQL instance seeded from a schema export) — **needed before Phase 2**

**Exit criteria:** `npm run dev` runs, Tailwind theme tokens render a styled placeholder page, DB pool connects successfully to a real/dev database.

---

## Phase 1 — Design System & Static Redesign (no data yet)

**Goal:** Nail the new visual direction with static/mock data before wiring real data, so design iteration doesn't block on the backend.

Reference layout (from inspiration site), adapted to Trollz Store's actual catalog:

1. **Header**: logo left, nav (Home / Shop / About / Contact), search, account, wishlist, cart icon with count — sticky, clean, no cluttered top bar
2. **Hero**: full-width banner/carousel, single strong headline + CTA (replace the current cramped `owl-carousel`)
3. **Category strip**: 3–4 large image cards (Fashion / Electronics / Home & Lifestyle / etc., pulled from real `category` table later) with "Explore →" links
4. **Value props row**: 4 icons — e.g. Authentic Products, Fast Delivery, Secure Payment, Free Shipping
5. **Flash Deals section**: countdown + product grid (exists in current site, keep it but restyle as proper cards, not stretched/misaligned ones)
6. **Trending / Featured products grid**: consistent card component (image, name, price, discount badge, quick-add)
7. **Newsletter signup**
8. **Footer**: multi-column (Shop, Company, Legal), socials, payment icons

- [ ] Build all sections above as static components with placeholder/mock data
- [ ] Fix the specific "terrible" positioning issues in the old site: inconsistent card heights, misaligned grids, cramped header, overlapping mobile category cards — audit `index.php` lines ~230–500 for the worst offenders
- [ ] Mobile-first responsive pass (current site has bolted-on `mobile-category-card` hacks — redesign should not need device-specific markup duplication)
- [ ] Dark-mode not required (legacy site doesn't have it) — skip unless requested

**Exit criteria:** Homepage looks and behaves like a real storefront at desktop/tablet/mobile widths, reviewed and approved before real data is wired in.

---

## Phase 2 — Data Layer & Core Pages (read-only)

**Goal:** Replace static mocks with real MySQL data.

- [ ] Map existing schema: `product`, `category`, `users`, `orders`, `order_items`, `checkout`, `cart`, `user_addresses`, `user_payment_methods`, `support_messages` (confirm exact columns via `DESCRIBE` during this phase — legacy code has drifted, e.g. `product` has `parent_category_id`, `subcategory_id`, `size_type`, `size_options` JSON, `discount`, `qty`, `shipped_from_abroad`, `img`)
- [ ] `lib/queries/*.js` — typed-ish query functions per entity (getProducts, getProductById, getCategories, getFlashSales, etc.), all parameterized (legacy code has raw string-interpolated SQL — **do not carry over the SQL injection patterns** from e.g. `run.php`, `payment.php`)
- [ ] Home page (`app/page.js`) wired to real categories + trending + flash sale products
- [ ] Product listing pages: `app/shop/page.js` (was `products-grid.php` / `products-list.php`), with category/subcategory filtering (was `admin/fetch_subcategories.php` logic)
- [ ] Product detail page: `app/product/[id]/page.js` (was `product.php`), including size options rendering from `size_options` JSON
- [ ] Search: `app/search/page.js` (was `search.php`/`search_result.php`)
- [ ] Static pages: About, Contact, Privacy Policy, Terms — straight content ports

**Exit criteria:** Browsing, filtering, searching, and viewing product detail all work against real data, no cart/auth needed yet.

---

## Phase 3 — Auth & Account

**Goal:** Replace PHP `$_SESSION` auth with a Next.js-appropriate session system.

- [ ] Choose session strategy: signed httpOnly cookie + server-side session table, or a library like `iron-session`/`next-auth` (credentials provider against `users` table). Recommend `iron-session` for minimal footprint given we're keeping raw MySQL.
- [ ] Password hashing: confirm legacy hash format in `users` table (verify `password_hash`/`bcrypt` was used) — if legacy passwords are weakly hashed, plan a rehash-on-login migration step
- [ ] Register / Login / Logout / Forgot-Password / Reset flows (`register.php`, `login.php`, `forget_passwd.php`, `reset.php`)
- [ ] Account area: order history (`mylist.php`), shipping addresses (`shipping-address.php`), payment methods list (`my_payment_method.php` — now just Flutterwave saved-customer refs, not raw card data), settings (`settings.php`), help/support (`help.php`)
- [ ] Server-side route protection for account pages (middleware or per-page session check)

**Exit criteria:** Users can register, log in, manage addresses, and view order history against real data.

---

## Phase 4 — Cart, Checkout & Payments

**Goal:** Full purchase flow, with Flutterwave replacing the custom card-tokenization system entirely.

- [ ] Cart: server-backed cart tied to session/user (was `cart` table + `ajax/update_cart_qty.php`, `ajax/cart_count.php`, `ajax/cart-modal-content.php`) — implement as API routes + client cart UI (drawer/modal, matching new design)
- [ ] Checkout page: address selection, order summary (was `checkout.php`)
- [ ] **Payment integration**: Flutterwave Standard/Inline checkout
  - Create `orders`/`checkout` record as `Pending`
  - Redirect to or open Flutterwave checkout
  - Verify transaction server-side via Flutterwave's verify-transaction API (webhook + redirect callback, replacing `verify-payment.php`/`payment.php`'s trust-the-query-param pattern — legacy code updates payment status from an unverified `$_GET['ref']` with no signature check, which is a fraud vector to close in the rewrite)
  - On verified success: mark order `PAID`, clear cart, send confirmation email
- [ ] Order confirmation & invoice: PDF generation (replace `dompdf`/`download-invoice.php` with a Node PDF lib, e.g. `@react-pdf/renderer` or `puppeteer` if needed) — can be deferred to Phase 6 if not launch-critical
- [ ] Transactional email (order confirmation, password reset) — replace PHPMailer with e.g. Resend/Nodemailer

**Exit criteria:** A user can add to cart, check out, pay via Flutterwave, and see a correctly verified order status — no unverified payment paths.

---

## Phase 5 — Remaining Storefront Features

- [ ] Newsletter signup (`newsletter.php`)
- [ ] Contact/support form → stores into `support_messages` (`ajax/send_support.php`)
- [ ] Wishlist ("My Review"/heart icon — currently a stub in legacy nav, decide if this ships now or later)
- [ ] Promo codes (currently a stub link in legacy nav — confirm with stakeholder whether this is real functionality to port or drop)
- [ ] SEO pass: metadata, sitemap, robots.txt, Open Graph tags (legacy only has a hardcoded meta description/keywords)

---

## Phase 6 — Admin Dashboard

**Goal:** Rebuild `admin/` inside the same Next.js app under `/admin`, gated by an admin role.

- [ ] Admin auth (separate role check, not just any logged-in user — was `admin/login.php` + its own session)
- [ ] Dashboard/orders: `orders.php`, `view-order.php`, `view_pending_orders.php`, `export-orders.php`
- [ ] Products: `add_product.php`, `edit_product.php`, `view_products.php`, `products-list.php` — including category/subcategory pickers (`fetch_subcategories.php`, `get_subcategories.php`) and Cloudinary upload
- [ ] Categories: `add_cat.php`
- [ ] Users: `view_users.php`
- [ ] Support inbox: `support_messages.php`, `view_support.php`, `resolve_support.php`, `delete_support.php`
- [ ] Flash sales generation: `generate_flash_sales.php`

**Exit criteria:** Store staff can manage products, categories, orders, and support tickets from the new admin UI; legacy PHP admin can be retired.

---

## Phase 7 — QA, Performance, Cutover

- [ ] Cross-browser/responsive QA of full purchase flow
- [ ] Load real production data into staging DB, smoke test
- [ ] Set up redirects for old PHP URLs → new Next.js routes (SEO preservation, e.g. `product.php?id=123` → `/product/123`)
- [ ] Performance pass: `next/image` everywhere, route-level caching for product listings, ISR for category/home pages
- [ ] Security review: confirm no raw SQL string interpolation remains, confirm no secrets committed, confirm Flutterwave webhook signature verification is enforced
- [ ] DNS/hosting cutover plan (old PHP host → Vercel or chosen Next.js host), keep PHP site as fallback until confidence is high

---

## Open items to confirm with stakeholder before/while building

- Whether "Promo Codes" and "My Review" (wishlist) are real features to port or placeholders to drop
- Legacy password hash format (affects Phase 3 auth migration strategy)
- Whether historical orders/users data needs to be migrated into the new session/auth model, or if this is effectively a fresh launch
- Final go/no-go on retiring `dompdf` invoices vs. keeping PDF generation on launch day
