# Task: Restructure Next.js Application Using Feature-Based Architecture

## Objective

Refactor the existing Next.js application into a scalable, maintainable feature-based architecture.

The goal is to:
- Separate routing from business logic.
- Organize code by business domain/features.
- Keep reusable UI components separate from feature-specific components.
- Improve maintainability as the application grows.

Do not change application behavior, UI, API contracts, or user flows unless required for restructuring.

---

# Current Stack

- Framework: Next.js (App Router)
- Language: JavaScript / JSX
- State Management: Redux Toolkit
- Styling: Existing styling solution (do not modify)
- Package manager: Keep existing setup

---

# Target Folder Structure

Move the application toward the following structure:

```
src/
├── app/
│   ├── layout.jsx
│   ├── globals.css
│   ├── StoreProvider.jsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.jsx
│   │   └── signup/
│   │       └── page.jsx
│   │
│   ├── (public)/
│   │   ├── page.jsx
│   │   ├── shop/
│   │   ├── product/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── pricing/
│   │
│   ├── admin/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   ├── approve/
│   │   ├── coupons/
│   │   └── stores/
│   │
│   └── store/
│       ├── layout.jsx
│       ├── page.jsx
│       ├── add-product/
│       ├── manage-product/
│       └── orders/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── products/
│   ├── cart/
│   ├── orders/
│   ├── store/
│   ├── admin/
│   ├── coupons/
│   └── reviews/
│
├── services/
│   ├── apiClient.js
│   └── uploadService.js
│
├── store/
│   └── index.js
│
├── hooks/
│
├── utils/
│
├── assets/
│
└── types/
```

---

# Feature Architecture Rules

Each feature should be self-contained.

Example:

```
features/products/

├── components/
│   ├── ProductCard.jsx
│   ├── ProductDetails.jsx
│   └── ProductDescription.jsx
│
├── hooks/
│
├── productApi.js
├── productSlice.js
├── types.js
└── utils.js
```

A feature can contain:

- Components
- Redux slices
- API functions
- Hooks
- Types
- Validation
- Utilities

---

# Refactoring Rules

## 1. Routes

The `app/` directory should only contain:

- Route definitions
- Layouts
- Loading states
- Error handling
- Page composition

Avoid placing:

- API calls
- Redux logic
- Business rules
- Complex components

inside `app/`.

---

## 2. Components

Split components into:

### Shared components

Move reusable components here:

```
components/

├── ui/
│   ├── Button.jsx
│   ├── Modal.jsx
│   └── Loading.jsx
│
├── layout/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── PageTitle.jsx
```

Examples:
- Navbar
- Footer
- Modal
- Button
- Input
- Loader


### Feature components

Move domain-specific components:

Examples:

```
features/products/components/

ProductCard.jsx
ProductDetails.jsx
ProductDescription.jsx
```

```
features/admin/components/

AdminSidebar.jsx
AdminNavbar.jsx
StoreInfo.jsx
```

```
features/store/components/

StoreSidebar.jsx
StoreNavbar.jsx
StoreLayout.jsx
```

---

## 3. Redux Structure

Move Redux slices out of `lib`.

Current:

```
lib/features/product/productSlice.js
```

Change to:

```
features/products/productSlice.js
```

Each feature owns its state:

```
features/cart/cartSlice.js

features/auth/authSlice.js

features/products/productSlice.js
```

Global Redux configuration remains:

```
store/
└── index.js
```

---

## 4. API Layer

Move API calls close to features.

Example:

Before:

```
lib/apiClient.js
product API calls mixed elsewhere
```

After:

```
services/
└── apiClient.js


features/products/
└── productApi.js


features/auth/
└── authApi.js
```

---

## 5. Imports

Update imports after moving files.

Prefer:

```javascript
import ProductCard from "@/features/products/components/ProductCard";
```

Avoid:

```javascript
import ProductCard from "../../../components/ProductCard";
```

Ensure `jsconfig.json` supports:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

# Asset Handling

Review current assets.

Move static files:

```
public/
```

Example:

```
public/
├── images/
├── icons/
└── uploads/
```

Keep imported assets:

```
src/assets/
```

Example:

```javascript
import logo from "@/assets/logo.png";
```

---

# Migration Strategy

Perform migration in safe steps:

## Step 1

Create new folders.

Do not delete old code yet.

---

## Step 2

Move reusable components.

Verify imports.

---

## Step 3

Move features:

Priority:

1. Authentication
2. Products
3. Cart
4. Orders
5. Store
6. Admin

---

## Step 4

Move Redux slices.

Update store configuration.

---

## Step 5

Clean unused files.

Remove:

- Duplicate components
- Empty folders
- Old imports

---

# Validation Checklist

After restructuring verify:

## Application

- [ ] Application starts successfully
- [ ] No build errors
- [ ] No broken imports

## Authentication

- [ ] Login works
- [ ] Signup works
- [ ] User state persists

## Products

- [ ] Product listing works
- [ ] Product details work
- [ ] Product creation works

## Cart

- [ ] Add/remove products works
- [ ] Cart state persists

## Orders

- [ ] Order history works

## Admin

- [ ] Admin routes work
- [ ] Store approval works

## Store Dashboard

- [ ] Product management works
- [ ] Store orders work

---

# Important Constraints

- Do not rewrite components unnecessarily.
- Do not change UI styling.
- Do not change API responses.
- Do not rename database fields.
- Do not introduce new libraries.
- Preserve existing functionality.
- Prefer moving and organizing code over rewriting.

---

# Final Deliverable

Provide:

1. New folder structure.
2. List of moved files.
3. Updated import changes.
4. Any files requiring manual review.
5. Confirmation that the application builds successfully.