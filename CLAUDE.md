# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Mangal Superfoods is a single-vendor e-commerce storefront (Next.js App Router + Tailwind CSS v4 + Redux Toolkit). It was forked from the open-source multi-vendor "GoCart" template (see `README.md`, which still carries the original GoCart branding/description — that hasn't been updated to match) and has since been narrowed to one store: the multi-vendor UI has been completely removed, and all vendor/admin write actions have been replaced with real API-backed implementations.

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

Required env vars (see `.env.example`): `NEXT_PUBLIC_CURRENCY_SYMBOL`, `NEXT_PUBLIC_API_BASE_URL` (base URL of the `mangal-superfoods-backend` service, e.g. `http://localhost:4000` in dev), and optionally `NEXT_PUBLIC_USE_MOCK_API` (set to `'true'` to run with mock fixtures, zero backend dependency — see "Mock API layer" below). There is no `DATABASE_URL`, WHAPI, or S3 config here anymore — those live in the backend repo's own `.env`.

For rapid development without the backend, set `NEXT_PUBLIC_USE_MOCK_API=true` and skip running `mangal-superfoods-backend` — the frontend will use in-memory mock fixtures. For integration testing, run both services: `npm install` + `npm run dev` in this repo (http://localhost:3000) and `npm install` + `npm run dev` in `mangal-superfoods-backend` (default port 4000) — see that repo's `CLAUDE.md`/`README.md` for its own commands.

## Architecture

### Three separate app areas, one codebase

The App Router is split into three independently-laid-out sections, each with its own `layout.jsx` and nav/sidebar chrome:

- `src/app/(public)/` — the customer storefront (home, `shop`, `product/[productId]`, `cart`, `orders`, `pricing`). Layout wraps pages with `Banner` + `Navbar` + `Footer` (`src/components/*`).
- `src/app/admin/` — admin dashboard (coupons management). Layout uses `src/components/admin/AdminLayout.jsx` (+ `AdminNavbar`/`AdminSidebar`), and client-side gates on `user.role === 'ADMIN'`.
- `src/app/store/` — the store/seller dashboard (add/manage products, orders). Layout uses `src/components/store/StoreLayout.jsx` (+ `StoreNavbar`/`StoreSidebar`). Note: it also gates on `user.role === 'ADMIN'` (not `SELLER`), even though `UserRole` includes a separate `SELLER` value — check `src/components/store/StoreLayout.jsx` before assuming `SELLER` grants access anywhere.
- `src/app/login/`, `src/app/signup/`, `src/app/profile/` — real, working auth pages (see "Auth" below), added after the original GoCart layout was set up; they sit outside the three chrome trees above and don't use `Banner`/`Navbar`/`Footer`.

When adding a page, match the persona it belongs to (customer/admin/store) and place it under the corresponding tree using the existing layout/component pair — don't build new chrome from scratch.

### State: Redux Toolkit, per-request store

`src/app/layout.jsx` (root) wraps the whole app in `StoreProvider` (`src/StoreProvider.js`), a client component that lazily creates the store via `makeStore()` (`src/store/index.js`) — this is the standard Next.js App Router pattern for keeping the Redux store request-scoped instead of a module-level singleton.

Slices live under `src/features/<name>/<name>Slice.js` and are combined in `src/store/index.js`: `cart`, `product`, `address`, `rating`, `user`. Follow the existing slice shape (plain `createSlice` reducers, e.g. `cartSlice.js` keyed by `productId`) when extending state. None of the slices seed from fixture data anymore — `product`/`address`/`rating` all start empty (`list: []`) and are populated by `useEffect` fetches via the feature's API module; `user` starts as `current: null` and is set by the login/signup flow via `authApi.js`.

### Frontend/backend split — no local DB, no local API routes

This repo used to have its own `src/app/api/` route handlers backed by Prisma/Postgres directly in-process. That has been split out: `mangal-superfoods-backend` (a sibling repo, Express + Prisma + Postgres) now owns the schema, migrations, seed script, and every API route, exposed over plain HTTP under `/api/*`. This repo has no `prisma/`, no `src/services/prisma.js`, no `src/services/s3.js`, and no `@prisma/client`/`pg`/`@aws-sdk/client-s3` dependencies — don't reintroduce direct DB/S3 access here.

**Don't import `apiFetch` directly in components/pages.** Instead, import from the feature's API module (e.g. `import { getProducts } from '@/features/products/api/productApi'`). Every feature has an `api/` folder with `<name>Api.js` that exports the API functions — these handle the mock/real toggle transparently, so call sites never branch on `USE_MOCK_API`.

`src/services/apiClient.js` exports `apiFetch(path, options)`, a thin `fetch()` wrapper that prefixes `process.env.NEXT_PUBLIC_API_BASE_URL` (falls back to `http://localhost:4000`) — used internally by the feature API modules.

`src/assets/assets.js`'s fixtures are **no longer imported anywhere** in `src/app/`, `src/components/`, or `src/features/` — don't reintroduce them. Fixtures now live alongside their API modules (e.g. `src/features/products/api/productMockData.js`).

The backend exposes (see its own `CLAUDE.md`/`README.md` for implementation details): `/api/products` (GET/POST) + `/api/products/:id` (GET/PUT/DELETE, S3 image upload), `/api/orders` (GET/POST) + `/api/orders/:id` (PUT — status updates), `/api/addresses` (GET/POST), `/api/ratings` (GET/POST), `/api/coupons` (GET/POST), `/api/users` (GET/POST/PUT), `/api/auth/login` (POST), `/api/sms/send` + `/api/sms/verify` (POST). Models: `User`, `Product`, `Order`/`OrderItem`, `Rating`, `Address`, `Coupon`, `OtpTemplate`, `OtpCode` — no `Store` model, and `Product` has no `storeId` (removed as part of the multi-vendor → single-vendor pivot).

Because the backend is a separate origin, it enables CORS for the frontend's origin (`FRONTEND_ORIGIN` env var on the backend) — if you add a new frontend origin (e.g. a new deployment URL), that env var needs updating on the backend side too, or requests will be blocked by the browser.

### Mock API layer — zero-backend development

Every feature has an `api/` folder (`src/features/<name>/api/`) containing:
- `<name>Api.js` — API call wrappers that check the `USE_MOCK_API` toggle and either return mock data or call the real backend
- `<name>MockData.js` — in-memory fixture data

Pages/components always import from the feature API module (e.g. `import { getProducts } from '@/features/products/api/productApi'`) and never branch on the toggle — the API module handles it transparently. Every exported function returns the same Response-like shape (`.ok`/`.json()`) whether mock or real.

Set `NEXT_PUBLIC_USE_MOCK_API=true` in `.env` to run the frontend with zero backend/DB dependency — all data operations use the local `*MockData.js` fixtures (mutated in place for creates/updates/deletes, but reset on page reload). This is useful for rapid development/demo cycles. `src/services/mockUtils.js` provides `mockResponse()` and `delay()` helpers for building the fake Response shape.

Mock auth fixtures are documented in `src/features/auth/api/authMockData.js` with three ready-to-use mobile/password logins (CUSTOMER/SELLER/ADMIN roles) and a fixed mock OTP code for testing SMS flows.

### All write actions are implemented

Form submit handlers are wired up to the UI (state, validation, `toast.promise(...)` loading/success/error UX) and call the backend via the feature API modules:

- `src/app/store/add-product/page.jsx` → `onSubmitHandler` — calls `productApi.createProduct()` → `POST /api/products` with `FormData`, uploads images
- `src/app/store/manage-product/page.jsx` → `toggleStock` and other handlers — calls `productApi.updateProduct()` → `PUT`/`DELETE` on `/api/products/[id]`
- `src/app/store/orders/page.jsx` → `updateOrderStatus` — calls `orderApi.updateOrder()` → `PUT /api/orders/[id]`
- `src/components/OrderSummary.jsx` → `handleCouponCode` / `handlePlaceOrder` — calls `couponApi.getCoupons()`, `orderApi.createOrder()`
- `src/components/AddressModal.jsx` → `handleSubmit` — calls `addressApi.createAddress()`
- `src/components/RatingModal.jsx` → `handleSubmit` — calls `ratingApi.createRating()`

Follow the pattern of existing feature API modules (e.g. `src/features/products/api/productApi.js`) when implementing new features: keep the existing `toast.promise(fn(), { loading: '...' })` call pattern at the call site — `fn()` is expected to resolve/reject to drive the toast's success/error state, so implementations should return a promise rather than swallowing errors internally. The feature API module handles both mock and real backend routes transparently.

### Auth is implemented (mobile + password + OTP) — but there's no session/middleware layer

`src/app/login/page.jsx` and `src/app/signup/page.jsx` implement a real auth flow via `src/features/auth/api/authApi.js`: mobile number lookup (`GET /api/users?mobile=...`), OTP send/verify over WhatsApp via the backend's `/api/sms/send` and `/api/sms/verify` (backed by `OtpCode`/`OtpTemplate` models, delivered through whapi.cloud), and password auth via `/api/auth/login` (passwords hashed with Node's `crypto.scryptSync`, salt:key format). The auth API module supports both real and mock backends (see "Mock API layer" section below). On success the app dispatches into the `user` Redux slice (`src/features/auth/userSlice.js`, `state.user.current`) — `Navbar.jsx` reads this to render `Hi, {user.name}` instead of the "Login" link.

`User.role` (`UserRole`: `CUSTOMER` / `ADMIN` / `SELLER`) exists on the schema and is checked client-side in `src/components/admin/AdminLayout.jsx` and `src/components/store/StoreLayout.jsx` (both currently require `role === 'ADMIN'`). **There is no `middleware.js` and no server-side session/route protection** — the Redux `user.current` state is just client-side UI state populated by the login flow, not a verified session, so don't assume `src/app/admin`/`src/app/store` are actually access-controlled server-side.

### Conventions

- Path alias `@/*` maps to `src/` (`jsconfig.json`), e.g. `@/components/Navbar`, `@/features/products/api/productApi`.
- **Feature API pattern**: Don't import `apiFetch` directly in components/pages. Always import from the feature API module (e.g. `import { getProducts } from '@/features/products/api/productApi'`). This ensures the mock/real toggle works transparently and call sites are agnostic of `USE_MOCK_API`.
- **Adding a new feature**: Create `src/features/<name>/` with `<name>Slice.js`, `api/<name>Api.js` (API wrappers), and `api/<name>MockData.js` (fixture data). See existing features like `src/features/products/` as templates.
- Currency is read from `process.env.NEXT_PUBLIC_CURRENCY_SYMBOL` with a `'$'` fallback, repeated per-component (`const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'`) rather than a shared helper — match this pattern in new components. Note some older components still hardcode a literal `$`/`₹` instead (e.g. inside `src/app/store/orders/page.jsx`'s order-detail modal) — don't assume the pattern has been applied everywhere.
- `next.config.mjs` disables image optimization (`images.unoptimized = true`) — `next/image` is used but images are served unoptimized.
- Font is `Outfit` via `next/font/google`, set up once in the root `src/app/layout.jsx`.
- Category lists are duplicated rather than shared: `src/assets/assets.js` exports a short `categories` list for the storefront, while `src/app/store/add-product/page.jsx` hardcodes its own longer, different category array inline. Keep this in mind if a category list needs to change — it's not a single source of truth.
