// Central toggle for the whole app: when true, every feature's `*Api.js` module
// resolves against its local `*MockData.js` fixtures instead of calling the
// mangal-superfoods-backend service over HTTP. Flip it (or set the env var) to
// develop/demo the frontend with zero backend dependency.
//
// Usage in a feature's api module:
//   import { USE_MOCK_API } from '@/config/api'
//   if (USE_MOCK_API) { ...return mock... } else { ...return apiFetch(...)... }
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
