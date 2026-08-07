# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mangal Superfoods is a single-vendor e-commerce storefront (Next.js App Router + Tailwind CSS v4 + Redux Toolkit). It was forked from the open-source multi-vendor "GoCart" template (see `README.md`, which still carries the original GoCart branding/description — that hasn't been updated to match) and has since been narrowed to one store: the multi-vendor `Store` model has been removed from the schema, and most vendor/admin write actions have been replaced with real API-backed implementations.

**This repo is frontend-only.** The Postgres database, Prisma schema, and all API routes now live in a separate sibling repo, `mangal-superfoods-backend` (a standalone Express app) — this frontend has no `app/api/`, no `prisma/`, and no direct DB/S3 access; every data operation goes over HTTP to that backend. See "Frontend/backend split" below before assuming any of the old in-repo API-route behavior still applies here.

## Commands

```bash
npm install                    # install dependencies
npm run dev                    # start dev server (Next.js + Turbopack), http://localhost:3000
npm run build                  # production build
npm run start                  # run the production build
npm run lint                   # next lint
```

There is no test suite/framework configured in this repo — don't assume Jest/Vitest exists.

Required env vars (see `.env.example`): `NEXT_PUBLIC_CURRENCY_SYMBOL`, `NEXT_PUBLIC_API_BASE_URL` (base URL of the `mangal-superfoods-backend` service, e.g. `http://localhost:4000` in dev). There is no `DATABASE_URL`, WHAPI, or S3 config here anymore — those live in the backend repo's own `.env`.

This frontend must be run alongside `mangal-superfoods-backend` (separate `npm install` + `npm run dev` in that repo, default port 4000) for any data-backed page to work — see that repo's `CLAUDE.md`/`README.md` for its own commands.

## Architecture

### Three separate app areas, one codebase

The App Router is split into three independently-laid-out sections, each with its own `layout.jsx` and nav/sidebar chrome:

- `app/(public)/` — the customer storefront (home, `shop`, `shop/[username]`, `product/[productId]`, `cart`, `orders`, `pricing`, `create-store`). Layout wraps pages with `Banner` + `Navbar` + `Footer` (`components/*`).
- `app/admin/` — admin dashboard (approve vendors, coupons, stores). Layout uses `components/admin/AdminLayout.jsx` (+ `AdminNavbar`/`AdminSidebar`), and client-side gates on `user.role === 'ADMIN'`.
- `app/store/` — the store/seller dashboard (add/manage products, orders). Layout uses `components/store/StoreLayout.jsx` (+ `StoreNavbar`/`StoreSidebar`). Note: it also gates on `user.role === 'ADMIN'` (not `SELLER`), even though `UserRole` includes a separate `SELLER` value — check `components/store/StoreLayout.jsx` before assuming `SELLER` grants access anywhere.
- `app/login/`, `app/signup/`, `app/profile/` — real, working auth pages (see "Auth" below), added after the original GoCart layout was set up; they sit outside the three chrome trees above and don't use `Banner`/`Navbar`/`Footer`.

**Multi-vendor UI is now vestigial.** `app/(public)/create-store/`, `app/admin/approve/`, and `app/admin/stores/` still exist and render, but there's no `Store` model left to back them (see below) — their submit handlers are still bare stubs. `app/(public)/shop/[username]/page.jsx` also still exists as a route but no longer looks up a store by username; it just renders all products and has a code comment noting this ("Single-store: route kept for now, but we don't render per-store mock data"). Don't treat any of these four as evidence that per-vendor functionality works — it doesn't.

When adding a page, match the persona it belongs to (customer/admin/store) and place it under the corresponding tree using the existing layout/component pair — don't build new chrome from scratch.

### State: Redux Toolkit, per-request store

`app/layout.jsx` (root) wraps the whole app in `StoreProvider` (`app/StoreProvider.js`), a client component that lazily creates the store via `makeStore()` (`lib/store.js`) — this is the standard Next.js App Router pattern for keeping the Redux store request-scoped instead of a module-level singleton.

Slices live under `lib/features/<name>/<name>Slice.js` and are combined in `lib/store.js`: `cart`, `product`, `address`, `rating`, `user`. Follow the existing slice shape (plain `createSlice` reducers, e.g. `cartSlice.js` keyed by `productId`) when extending state. None of the slices seed from fixture data anymore (see below) — `product`/`address`/`rating` all start empty (`list: []`) and are populated by `useEffect` fetches against the API routes; `user` starts as `current: null` and is set by the login/signup flow.

### Frontend/backend split — no local DB, no local API routes

This repo used to have its own `app/api/` route handlers backed by Prisma/Postgres directly in-process. That has been split out: `mangal-superfoods-backend` (a sibling repo, Express + Prisma + Postgres) now owns the schema, migrations, seed script, and every API route, exposed over plain HTTP under `/api/*`. This repo has no `prisma/`, no `lib/prisma.js`, no `lib/s3.js`, and no `@prisma/client`/`pg`/`@aws-sdk/client-s3` dependencies — don't reintroduce direct DB/S3 access here.

`lib/apiClient.js` exports `apiFetch(path, options)`, a thin `fetch()` wrapper that prefixes `process.env.NEXT_PUBLIC_API_BASE_URL` (falls back to `http://localhost:4000`). Every call site that used to `fetch('/api/...')` now calls `apiFetch('/api/...')` instead — same path, same options (JSON bodies, `FormData` for image uploads, etc.), just routed to the external backend. When adding a new API call, use `apiFetch` rather than raw `fetch('/api/...')`.

`assets/assets.js`'s fixtures (`dummyStoreData`, `dummyRatingsData`, `productDummyData`, `addressDummyData`) are **no longer imported anywhere** in `app/`, `components/`, or `lib/` — don't reintroduce them.

The backend exposes (see its own `CLAUDE.md`/`README.md` for implementation details): `/api/products` (GET/POST) + `/api/products/:id` (GET/PUT/DELETE, S3 image upload), `/api/orders` (GET/POST) + `/api/orders/:id` (PUT — status updates), `/api/addresses` (GET/POST), `/api/ratings` (GET/POST), `/api/coupons` (GET/POST), `/api/users` (GET/POST/PUT), `/api/auth/login` (POST), `/api/sms/send` + `/api/sms/verify` (POST). Models: `User`, `Product`, `Order`/`OrderItem`, `Rating`, `Address`, `Coupon`, `OtpTemplate`, `OtpCode` — no `Store` model, and `Product` has no `storeId` (removed as part of the multi-vendor → single-vendor pivot).

Because the backend is a separate origin, it enables CORS for the frontend's origin (`FRONTEND_ORIGIN` env var on the backend) — if you add a new frontend origin (e.g. a new deployment URL), that env var needs updating on the backend side too, or requests will be blocked by the browser.

### Mock API layer — `NEXT_PUBLIC_USE_MOCK_API`

Every feature that talks to the backend has an `api/` folder alongside its slice/components (e.g. `src/features/products/api/`, `src/features/orders/api/`, `src/features/cart/api/`, `src/features/coupons/api/`, `src/features/reviews/api/`, `src/features/auth/api/`), each holding a `<name>Api.js` + a `<name>MockData.js`. Pages/components import from these `*Api.js` modules — not `apiFetch` directly — and every exported function returns the same Response-like shape (`.ok`/`.json()`) whether it hits the real backend or mock fixtures, so call sites never branch on the toggle themselves.

`src/config/api.js` exports `USE_MOCK_API` (reads `NEXT_PUBLIC_USE_MOCK_API`, default `false`). When `true`, every `*Api.js` module resolves against its in-memory `*MockData.js` fixtures (mutated in place for creates/updates/deletes, but reset on page reload) instead of calling `apiFetch`/the backend — useful for running the frontend with zero backend/DB dependency. `src/services/mockUtils.js`'s `mockResponse()` is the shared helper that builds that fake Response. Mock auth fixtures (`src/features/auth/api/authMockData.js`) document three ready-to-use mobile/password logins (CUSTOMER/SELLER/ADMIN) and a fixed mock OTP; see that file's comments.

### Most write actions are now implemented — only the vendor/admin stubs remain

Earlier in this repo's history, form submit handlers were wired up to the UI (state, validation, `toast.promise(...)` loading/success/error UX) with a bare `// Logic to ...` comment and no implementation. **Most of these have since been implemented** and now call the API routes above:

- `app/store/add-product/page.jsx` → `onSubmitHandler` — ✅ implemented (`POST /api/products` with `FormData`, uploads images)
- `app/store/manage-product/page.jsx` → `toggleStock` and other handlers — ✅ implemented (`PUT`/`DELETE` on `/api/products/[id]`)
- `app/store/orders/page.jsx` → `updateOrderStatus` — ✅ implemented (`PUT /api/orders/[id]`)
- `components/OrderSummary.jsx` → `handleCouponCode` / `handlePlaceOrder` — ✅ implemented (`/api/coupons`, `/api/orders`)
- `components/AddressModal.jsx` → `handleSubmit` — ✅ implemented (`/api/addresses`)
- `components/RatingModal.jsx` → `handleSubmit` — ✅ implemented (`/api/ratings`)

Still bare `// Logic to ...` stubs — all of them vendor/multi-store admin flows with no backing model (see "vestigial" note above), the actual remaining gap to fill if this functionality is ever revived:

- `app/admin/approve/page.jsx` → `handleApprove`: *Logic to approve a store*
- `app/admin/stores/page.jsx` → `toggleIsActive`: *Logic to toggle the status of a store*
- `app/admin/coupons/page.jsx` → `handleAddCoupon` / `deleteCoupon`: *Logic to add/delete a coupon*
- `app/(public)/create-store/page.jsx` → two handlers: *check if the store is already submitted* / *submit the store details*

When implementing one of these, keep the existing `toast.promise(fn(), { loading: '...' })` call pattern at the call site — `fn()` is expected to resolve/reject to drive the toast's success/error state, so implementations should return a promise rather than swallowing errors internally (this is the pattern the already-implemented handlers above follow).

### Auth is implemented (mobile + password + OTP) — but there's no session/middleware layer

`app/login/page.jsx` and `app/signup/page.jsx` implement a real auth flow: mobile number lookup (`GET /api/users?mobile=...`), OTP send/verify over WhatsApp via the backend's `/api/sms/send` and `/api/sms/verify` (backed by `OtpCode`/`OtpTemplate` models, delivered through whapi.cloud), and password auth via `/api/auth/login` (passwords hashed with Node's `crypto.scryptSync`, salt:key format). All of these are `apiFetch` calls to `mangal-superfoods-backend`, not local routes. On success the app dispatches into the `user` Redux slice (`lib/features/user/userSlice.js`, `state.user.current`) — `Navbar.jsx` reads this to render `Hi, {user.name}` instead of the "Login" link.

`User.role` (`UserRole`: `CUSTOMER` / `ADMIN` / `SELLER`) exists on the schema and is checked client-side in `components/admin/AdminLayout.jsx` and `components/store/StoreLayout.jsx` (both currently require `role === 'ADMIN'`). **There is no `middleware.js` and no server-side session/route protection** — the Redux `user.current` state is just client-side UI state populated by the login flow, not a verified session, so don't assume `app/admin`/`app/store` are actually access-controlled server-side.

### Conventions

- Path alias `@/*` maps to the repo root (`jsconfig.json`), e.g. `@/components/Navbar`.
- Currency is read from `process.env.NEXT_PUBLIC_CURRENCY_SYMBOL` with a `'$'` fallback, repeated per-component (`const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'`) rather than a shared helper — match this pattern in new components. Note some older components still hardcode a literal `$`/`₹` instead of using this pattern (e.g. inside `app/store/orders/page.jsx`'s order-detail modal) — don't assume the pattern has been applied everywhere.
- `next.config.mjs` disables image optimization (`images.unoptimized = true`) — `next/image` is used but images are served unoptimized.
- Font is `Outfit` via `next/font/google`, set up once in the root `app/layout.jsx`.
- Category lists are duplicated rather than shared: `assets/assets.js` exports a short `categories` list for the storefront, while `app/store/add-product/page.jsx` hardcodes its own longer, different category array inline. Keep this in mind if a category list needs to change — it's not a single source of truth.
