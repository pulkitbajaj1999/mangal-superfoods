# Frontend Improvement Plan

Goal: strip out code that's no longer used, and bring the customer-facing storefront up to what a
standard e-commerce frontend needs. Ordered so each phase can be built, shipped, and manually verified
on its own before moving to the next; Phase 7 is a full integration pass across everything.

Findings below come from an actual pass over the current code (not assumptions) — see the "Evidence"
line under each item.

## How to use this plan

- Work top to bottom. Don't start phase *N+1* until phase *N*'s checkpoint passes.
- Each phase ends with a **Checkpoint** — a concrete, repeatable check (manual click-through, `npm run
  build`, etc.) run against this frontend + a live `mangal-superfoods-backend`.
- Anything marked **⚠ needs a decision** should be confirmed before code is written/deleted, not
  discovered after the fact.
- Suggested: create a working branch off `seperate-backend` for this effort (e.g.
  `feature/storefront-cleanup`) so each phase can land as its own commit/PR.

---

## Phase 0 — Setup

1. Create a working branch for this effort.
2. Confirm `mangal-superfoods-backend` is checked out and runnable locally (`npm run dev`, port 4000) —
   every checkpoint below assumes it's running.

**Checkpoint:** `npm run dev` on both repos; home page loads real products at `localhost:3000`.

---

## Phase 1 — Dead code cleanup

Do this first so later phases aren't built on top of code that's about to be deleted, and so diffs in
later phases aren't noisy.

1. **Remove the unused `happy_store` import in `assets/assets.js`.**
   Evidence: `import happy_store from "./happy_store.webp"` is never referenced anywhere else in the
   repo, and isn't included in the exported `assets` object — dead import.

2. **Strip dead commented-out JSX** (e.g. the commented nav links and "plus" badge in
   `components/Navbar.jsx`, and similar blocks elsewhere — ~47 commented-out JSX lines found across
   `app/` and `components/`). Delete rather than leave commented; git history preserves it if ever
   needed.

3. **⚠ Needs a decision — remove the vestigial multi-vendor stub routes**, since there's no `Store`
   model behind any of them and their handlers are bare stubs (per `CLAUDE.md`):
   - `app/(public)/create-store/`
   - `app/admin/approve/`
   - `app/admin/stores/`
   - `app/(public)/shop/[username]/`
   - `components/admin/StoreInfo.jsx` (only consumer is the four routes above)

   Also remove the now-dead admin sidebar/nav links that point at `approve`/`stores` once those routes
   are gone (`components/admin/AdminSidebar.jsx` / `AdminNavbar.jsx`).

   Confirm before deleting: this is a real product decision (are these routes coming back once a
   multi-vendor model returns, or gone for good?), not just a cleanup call. Default recommendation:
   delete — the repo has already fully committed to single-vendor, and dead routes with bare stubs
   are more confusing than a 404.

4. Run a quick unused-export/dependency sanity pass: `npm run lint`, plus a manual check that every
   `package.json` dependency is still imported somewhere (all current ones are, as of this pass —
   re-verify after step 3's deletions in case something (e.g. `lucide-react` icons only used by the
   deleted pages) becomes orphaned).

**Checkpoint:**
- `npm run lint` and `npm run build` both pass clean.
- Manual click-through: home, shop, product detail, cart, checkout, orders, login, signup, profile,
  admin dashboard, store dashboard all still load with no console errors.
- If step 3 was done: confirm `/create-store`, `/admin/approve`, `/admin/stores`, and
  `/shop/[anything]` now correctly 404 (or redirect, per whatever you decided), and no remaining link
  in the app points at them.

---

## Phase 2 — Core shopping experience gaps

The highest-value missing pieces for a "standard" storefront.

1. **Category filter + sort on the Shop page.**
   Evidence: `app/(public)/shop/page.jsx` only supports a `?search=` query filter by name; there's no
   way to filter by the `categories` list already exported from `assets/assets.js`, and no sort by
   price/rating/newest.
   - Add category chips/dropdown and a sort control, combinable with the existing search param.

2. **Pagination or "load more" on product listings.**
   Evidence: `app/(public)/shop/page.jsx`, `components/AllProducts.jsx`, `components/LatestProducts.jsx`,
   and `components/BestSelling.jsx` all render their full result set with no paging — fine at current
   catalog size, not once it grows.

3. **Wishlist.**
   Evidence: no `wishlist` concept anywhere in the codebase (`lib/features/`, components, or backend
   API surface per `CLAUDE.md`).
   - New Redux slice `lib/features/wishlist/wishlistSlice.js`, following the existing `cart` slice's
     shape/conventions.
   - Heart/save icon on `ProductCard.jsx` and `ProductDetails.jsx`.
   - New route `app/(public)/wishlist/page.jsx`.
   - **Backend note:** there's no `/api/wishlist` route in `mangal-superfoods-backend` today — persist
     to `localStorage` for now (mirroring how `Navbar.jsx` already persists `store_user`), and flag a
     backend follow-up if cross-device persistence is wanted later.

**Checkpoint:** on the live backend catalog — filter by two different categories, sort by price
ascending/descending, page through results, add/remove items from the wishlist and confirm they
survive a page reload. Re-run the cart → checkout flow once to confirm nothing in Phase 2 regressed it.

---

## Phase 3 — Product page & discovery

1. **Related/similar products** on the product detail page (same category, excluding the current
   product). Evidence: `components/ProductDescription.jsx` has no related-products section today.

2. **Clickable breadcrumbs.** Evidence: `app/(public)/product/[productId]/page.jsx` renders
   `Home / Products / {category}` as static text, not links.

3. **Loading/empty-state polish**: replace the plain `"Loading products..."` /
   `"Loading product..."` / `"Product not found"` text (currently literal strings in
   `app/(public)/shop/page.jsx` and `app/(public)/product/[productId]/page.jsx`) with skeleton loaders
   and a proper not-found state with a link back to `/shop`.

**Checkpoint:** from a product page, follow a related product into a different product, then follow a
breadcrumb back to its category listing. Load a product page on a throttled connection to see the
skeleton, and visit a bogus `/product/xyz` to see the improved not-found state.

---

## Phase 4 — Site-wide pages every storefront needs

1. **Custom 404** — `app/not-found.jsx` (there is currently none at all, at any level).

2. **Global error boundary** — `app/error.jsx` (also currently absent).

3. **Contact page** — `app/(public)/contact/page.jsx`.
   Evidence: `components/Navbar.jsx` already links to `/contact`, but the route doesn't exist —
   this is a live dead link today. **⚠ needs a decision:** the backend has no contact-form endpoint
   listed in `CLAUDE.md` — decide whether this posts to a new backend endpoint, a `mailto:` link, or an
   external form service, before building it.

4. **Newsletter signup** — `components/Newsletter.jsx` currently renders an input + button with no
   `onSubmit`, no state, and no API call; it's decorative. **⚠ needs a decision:** same as above — wire
   it to a real endpoint (needs backend support) or drop the section until there's somewhere for it to
   post to. Don't ship a form that silently does nothing when submitted.

**Checkpoint:** visit an unknown path (`/this-does-not-exist`) → styled 404. Trigger a thrown error in
a dev build → styled error boundary, not a raw stack trace. Submit the contact form and confirm the
decided-on behavior actually happens (email sent / endpoint called / etc). Submit the newsletter form
and confirm it does what was decided, or that the dead-end version has been removed.

---

## Phase 5 — SEO metadata

1. Add `metadata` / `generateMetadata` to the public pages that are missing it — home, shop, and
   especially `product/[productId]` (dynamic title/description/OG image per product).
   Evidence: only `app/layout.jsx`, `app/admin/layout.jsx`, and `app/store/layout.jsx` export
   `metadata` today — none of the `app/(public)/*` pages do, so every storefront page currently shares
   the root's generic title/description, including individual product pages.

**Checkpoint:** view source (or Next.js's metadata debug output) on two different product pages and
confirm the `<title>`/description differ and match the product shown.

---

## Phase 6 — Payment integration

1. **⚠ needs a decision.** `components/OrderSummary.jsx` already renders a "Stripe Payment" radio
   option (`paymentMethod = 'STRIPE'`) alongside COD, but there is no `stripe` / `@stripe/stripe-js`
   dependency anywhere in `package.json`, and no Stripe checkout/redirect flow — selecting it just sends
   the literal string `'STRIPE'` to `POST /api/orders` with no actual payment collected. This is a
   non-functional option presented as if it works.
   - Option A: build the real integration (needs a corresponding backend Stripe session/webhook
     endpoint — coordinate with `mangal-superfoods-backend` first).
   - Option B: remove the Stripe radio option and ship COD-only until the backend side exists.
   Either is fine; leaving it as-is (a button that appears to work but doesn't charge anything) is the
   one option to avoid.

**Checkpoint:** place a COD order end-to-end (cart → address → place order → shows up in `/orders`
with correct status). If Option A was taken, complete one order using Stripe test-mode card details and
confirm the order and payment status both land correctly.

---

## Phase 7 — Final integration pass

1. Full manual smoke test with the backend running, across all three app areas:
   - Customer: browse → filter/sort → wishlist → product detail → related products → cart → address →
     coupon → place order (both payment paths if both exist) → view in `/orders` → leave a rating.
   - Admin: login as an `ADMIN` user, confirm dashboard loads, coupons management works (already
     implemented per `CLAUDE.md`), confirm any deleted vestigial pages are actually gone from nav.
   - Store: login as an `ADMIN` user (per the existing `StoreLayout.jsx` gate), add a product, toggle
     stock, update an order's status.
2. `npm run build` (production build) and `npm run lint` — both clean.
3. **Update the docs to match reality**: `docs/architecture.md` and the root `CLAUDE.md` both currently
   describe the vestigial routes, the missing-metadata state, and the fake Stripe option as known facts
   — once phases 1–6 change any of that, update both docs in the same PR so they don't go stale again.

**Checkpoint:** everything in step 1 works against a clean `npm install` + fresh backend, the build is
clean, and the docs match what's actually in the code.

---

## Suggested order recap

```
Phase 0  Setup
Phase 1  Dead code cleanup            (safe, unblocks everything else)
Phase 2  Filter/sort, pagination, wishlist
Phase 3  Related products, breadcrumbs, loading/empty states
Phase 4  404, error boundary, contact page, newsletter
Phase 5  SEO metadata
Phase 6  Payment integration decision
Phase 7  Full integration pass + doc updates
```
