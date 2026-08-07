# Architecture

This document describes how the `mangal-superfoods-frontend` repo is put together: the app areas, state
management, and the split between this repo and `mangal-superfoods-backend`. For day-to-day commands and
conventions, see the root [CLAUDE.md](../CLAUDE.md) — this doc goes deeper on structure and data flow.

## Overview

Mangal Superfoods is a **single-vendor e-commerce storefront**. The stack is:

- **Next.js (App Router)** — v16, with Turbopack in dev
- **React 19**
- **Tailwind CSS v4**
- **Redux Toolkit** for client state
- **Recharts** for the store dashboard's orders chart

The project was forked from the open-source multi-vendor "GoCart" template (the root `README.md` still
carries the original GoCart branding — that hasn't been updated) and has since been narrowed to one store.
The `Store` model has been removed from the data model entirely, and most vendor/admin write actions have
been replaced with real, API-backed implementations. A few multi-vendor UI screens still exist as routes
but are vestigial — see [Vestigial multi-vendor UI](#vestigial-multi-vendor-ui) below.

**This repo is frontend-only.** There is no database, no Prisma schema, and no API route handlers here.
Every data operation is an HTTP call to a separate sibling repo, `mangal-superfoods-backend` (a standalone
Express + Prisma + Postgres app). See [Frontend/backend split](#frontendbackend-split) for details.

## Repository layout

```
app/                    Next.js App Router pages (three independent chrome trees, see below)
components/             Shared React components, plus admin/ and store/ subfolders for those areas' chrome
lib/
  apiClient.js          apiFetch() — the only way this repo talks to the backend
  store.js              Redux store factory (makeStore)
  features/<name>/      Redux slices: cart, product, address, rating, user
assets/
  assets.js             Static image imports, category list, misc UI fixture data (icons, spec copy)
app/StoreProvider.js    Client component that lazily creates the per-request Redux store
next.config.mjs         images.unoptimized = true
jsconfig.json           @/* path alias → repo root
.env.example            NEXT_PUBLIC_CURRENCY_SYMBOL, NEXT_PUBLIC_API_BASE_URL
```

## The three app areas

The App Router is split into three independently-laid-out sections, each with its own `layout.jsx` and
nav/sidebar chrome. There is no shared top-level layout beyond the root `app/layout.jsx` (fonts, Redux
`StoreProvider`, `react-hot-toast`'s `Toaster`).

### 1. Customer storefront — `app/(public)/`

Routes: `page.jsx` (home), `shop/`, `shop/[username]/`, `product/[productId]/`, `cart/`, `orders/`,
`pricing/`, `create-store/`, `loading/`.

Layout (`app/(public)/layout.jsx`) wraps pages with `Banner` → `Navbar` → page content → `Footer`
(all in `components/`). Home page composes `Hero`, `CategoriesMarquee`, `LatestProducts`, `BestSelling`,
`OurSpec`, `Newsletter`.

### 2. Admin dashboard — `app/admin/`

Routes: `page.jsx` (dashboard), `approve/`, `coupons/`, `stores/`.

Layout uses `components/admin/AdminLayout.jsx` (+ `AdminNavbar`, `AdminSidebar`). Gates client-side on
`user.role === 'ADMIN'` — see [Auth caveats](#auth-is-real-but-theres-no-server-side-session-layer).

### 3. Store (seller) dashboard — `app/store/`

Routes: `page.jsx` (dashboard), `add-product/`, `manage-product/`, `orders/`.

Layout uses `components/store/StoreLayout.jsx` (+ `StoreNavbar`, `StoreSidebar`). **Also gates on
`user.role === 'ADMIN'`**, not `SELLER`, even though `UserRole` includes a distinct `SELLER` value —
don't assume a `SELLER` account has access here without checking `StoreLayout.jsx` first.

### Outside the three trees — `app/login/`, `app/signup/`, `app/profile/`

Real, working auth pages added after the original GoCart layout was set up. They don't use
`Banner`/`Navbar`/`Footer` and have no shared chrome of their own.

### Vestigial multi-vendor UI

These routes still exist and render, but have no model behind them (no `Store` model — see
[Data model](#data-model-owned-by-the-backend) below) and their submit handlers are bare stubs:

- `app/(public)/create-store/` — "become a seller" form
- `app/admin/approve/` — approve pending stores
- `app/admin/stores/` — list/toggle stores
- `app/(public)/shop/[username]/page.jsx` — still routable, but no longer looks up a store by username;
  it renders all products (there's a code comment noting this: *"Single-store: route kept for now, but
  we don't render per-store mock data"*)

Don't treat any of these four as evidence that per-vendor functionality works.

## State management: Redux Toolkit, per-request store

`app/layout.jsx` wraps the app in `StoreProvider` (`app/StoreProvider.js`), a client component that
lazily creates the store via `makeStore()` (`lib/store.js`). This is the standard Next.js App Router
pattern for keeping the Redux store request-scoped rather than a module-level singleton (avoids leaking
state across requests/users on the server).

Slices (`lib/features/<name>/<name>Slice.js`), combined in `lib/store.js`:

| Slice      | Initial state                          | Notes |
|------------|-----------------------------------------|-------|
| `cart`     | `{ total: 0, cartItems: {} }`           | `cartItems` keyed by `productId` → quantity |
| `product`  | `{ list: [] }`                          | populated by `useEffect` fetch, not seeded |
| `address`  | `{ list: [] }`                          | populated by `useEffect` fetch, not seeded |
| `rating`   | `{ list: [] }`                          | populated by `useEffect` fetch, not seeded |
| `user`     | `{ current: null }`                     | set by login/signup; actions: `setUser`, `login`, `logout`, `updateProfile` |

None of the slices seed from `assets/assets.js` fixtures anymore — `product`/`address`/`rating` all
start empty and are populated by API calls against the backend. Follow the existing plain-`createSlice`
shape (e.g. `cartSlice.js`) when extending state.

## Frontend/backend split

This repo used to have its own `app/api/` route handlers backed by Prisma/Postgres in-process. That has
been fully split out:

- **`mangal-superfoods-backend`** (sibling repo, Express + Prisma + Postgres) owns the schema,
  migrations, seed script, and every API route under `/api/*`.
- This repo has **no `app/api/`, no `prisma/`, no `lib/prisma.js`, no `lib/s3.js`**, and none of
  `@prisma/client` / `pg` / `@aws-sdk/client-s3` as dependencies. Don't reintroduce direct DB/S3 access
  here — all data operations go over HTTP.

### `lib/apiClient.js`

```js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export function apiFetch(path, options) {
  return fetch(`${API_BASE_URL}${path}`, options);
}
```

A thin `fetch()` wrapper that prefixes `NEXT_PUBLIC_API_BASE_URL`. Every call site that used to
`fetch('/api/...')` now calls `apiFetch('/api/...')` instead — same path, same options (JSON bodies,
`FormData` for image uploads, etc.), just routed to the external backend. **Use `apiFetch` for any new
API call** rather than raw `fetch('/api/...')`.

Because the backend is a separate origin, it enables CORS for the frontend's origin
(`FRONTEND_ORIGIN` env var, set on the *backend*). Adding a new frontend deployment origin requires
updating that env var on the backend side too, or requests get blocked by the browser.

### Backend API surface (implemented in the sibling repo)

- `/api/products` (GET/POST), `/api/products/:id` (GET/PUT/DELETE, S3 image upload)
- `/api/orders` (GET/POST), `/api/orders/:id` (PUT — status updates)
- `/api/addresses` (GET/POST)
- `/api/ratings` (GET/POST)
- `/api/coupons` (GET/POST)
- `/api/users` (GET/POST/PUT)
- `/api/auth/login` (POST)
- `/api/sms/send`, `/api/sms/verify` (POST) — OTP over WhatsApp via whapi.cloud

### Data model (owned by the backend)

`User`, `Product`, `Order` / `OrderItem`, `Rating`, `Address`, `Coupon`, `OtpTemplate`, `OtpCode`.
**No `Store` model**, and `Product` has no `storeId` (removed in the multi-vendor → single-vendor
pivot). `User.role` is a `UserRole` enum: `CUSTOMER` / `ADMIN` / `SELLER`.

## Write-action implementation status

Most form submit handlers that were originally bare `// Logic to ...` stubs (state, validation, and
`toast.promise(...)` loading/success/error UX already wired up) have since been implemented against the
backend:

| Location | Handler | Status |
|---|---|---|
| `app/store/add-product/page.jsx` | `onSubmitHandler` | ✅ implemented — `POST /api/products` with `FormData`, uploads images |
| `app/store/manage-product/page.jsx` | `toggleStock` and others | ✅ implemented — `PUT`/`DELETE` on `/api/products/[id]` |
| `app/store/orders/page.jsx` | `updateOrderStatus` | ✅ implemented — `PUT /api/orders/[id]` |
| `components/OrderSummary.jsx` | `handleCouponCode` / `handlePlaceOrder` | ✅ implemented — `/api/coupons`, `/api/orders` |
| `components/AddressModal.jsx` | `handleSubmit` | ✅ implemented — `/api/addresses` |
| `components/RatingModal.jsx` | `handleSubmit` | ✅ implemented — `/api/ratings` |

Still bare stubs — all vendor/multi-store admin flows with no backing model (the real remaining gap, if
this functionality is ever revived):

| Location | Handler | Stub comment |
|---|---|---|
| `app/admin/approve/page.jsx` | `handleApprove` | *Logic to approve a store* |
| `app/admin/stores/page.jsx` | `toggleIsActive` | *Logic to toggle the status of a store* |
| `app/admin/coupons/page.jsx` | `handleAddCoupon` / `deleteCoupon` | *Logic to add/delete a coupon* |
| `app/(public)/create-store/page.jsx` | two handlers | *check if the store is already submitted* / *submit the store details* |

When implementing one of these, keep the existing `toast.promise(fn(), { loading: '...' })` pattern at
the call site — `fn()` is expected to resolve/reject to drive the toast, so implementations should
return a promise rather than swallowing errors internally.

## Auth is real, but there's no server-side session layer

`app/login/page.jsx` and `app/signup/page.jsx` implement a working auth flow:

1. Mobile number lookup — `GET /api/users?mobile=...`
2. OTP send/verify over WhatsApp — `POST /api/sms/send`, `POST /api/sms/verify` (backed by
   `OtpCode`/`OtpTemplate` models, delivered through whapi.cloud)
3. Password auth — `POST /api/auth/login` (passwords hashed with Node's `crypto.scryptSync`, stored as
   `salt:key`)

All of these are `apiFetch` calls to `mangal-superfoods-backend` — none are local routes. On success the
app dispatches into the `user` Redux slice (`state.user.current`); `Navbar.jsx` reads this to render
`Hi, {user.name}` instead of a "Login" link.

`User.role` is checked **client-side only**, in `components/admin/AdminLayout.jsx` and
`components/store/StoreLayout.jsx` (both require `role === 'ADMIN'`). **There is no `middleware.js`
and no server-side session/route protection** — `state.user.current` is just client-side UI state
populated by the login flow, not a verified session. Don't assume `app/admin` or `app/store` are
actually access-controlled server-side; a user who directly navigates there without going through the
client-side check (or with client JS disabled) is not blocked by anything on the server.

## Conventions

- **Path alias**: `@/*` → repo root (`jsconfig.json`), e.g. `@/components/Navbar`.
- **Currency**: read from `process.env.NEXT_PUBLIC_CURRENCY_SYMBOL` with a `'$'` fallback, repeated
  per-component (`const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'`) rather than a shared
  helper — match this in new components. Some older components hardcode a literal `$`/`₹` instead (e.g.
  the order-detail modal in `app/store/orders/page.jsx`) — the pattern isn't applied everywhere.
- **Images**: `next.config.mjs` sets `images.unoptimized = true` — `next/image` is used, but images are
  served unoptimized (no Next.js image optimization pipeline, since there's no server-side image infra
  configured for this deployment).
- **Font**: `Outfit` via `next/font/google`, set up once in the root `app/layout.jsx`.
- **Category lists are duplicated, not shared**: `assets/assets.js` exports a short `categories` list
  for the storefront, while `app/store/add-product/page.jsx` hardcodes its own longer, different category
  array inline. There's no single source of truth — update both if a category list needs to change.

## Environment variables

Set in `.env` (see `.env.example`):

| Variable | Purpose | Example |
|---|---|---|
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | Currency symbol used across price displays | `'₹'` |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the `mangal-superfoods-backend` service | `http://localhost:4000` |

There is no `DATABASE_URL`, WHAPI, or S3 config in this repo — those live in the backend repo's own
`.env`.

## Running locally

This frontend must be run **alongside** `mangal-superfoods-backend` for any data-backed page to work:

```bash
# in mangal-superfoods-backend
npm install
npm run dev          # default port 4000

# in this repo
npm install
npm run dev           # Next.js + Turbopack, http://localhost:3000
```

Other commands:

```bash
npm run build          # production build
npm run start           # run the production build
npm run lint             # next lint
```

There is no test suite/framework configured in this repo (no Jest/Vitest).

## Key dependencies

| Package | Role |
|---|---|
| `next` | App Router framework (Turbopack in dev) |
| `react` / `react-dom` | v19 |
| `@reduxjs/toolkit` / `react-redux` | Client state |
| `tailwindcss` / `@tailwindcss/postcss` | Styling (v4) |
| `react-hot-toast` | Toast notifications, incl. `toast.promise` for async form handlers |
| `recharts` | Orders chart in the store dashboard (`components/OrdersAreaChart.jsx`) |
| `date-fns` | Date formatting |
| `lucide-react` | Icon set |

Notably absent (moved to the backend repo): `@prisma/client`, `pg`, `@aws-sdk/client-s3`.
