// Base URL of the standalone mangal-superfoods-backend service (Express + Prisma).
// The frontend no longer has its own /api routes — everything is fetched from here.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

/**
 * Thin wrapper around fetch() that prefixes API_BASE_URL, so call sites only need to
 * pass the path (e.g. apiFetch('/api/products')) instead of repeating the base URL.
 * Options are passed through to fetch() unchanged (method, headers, body, FormData, etc).
 */
export function apiFetch(path, options) {
  return fetch(`${API_BASE_URL}${path}`, options);
}

export default API_BASE_URL;
