// Shared helpers for feature-level mock API modules (`features/*/api/*Api.js`).
//
// Call sites throughout the app already do `const response = await apiFetch(...)`
// then check `response.ok` and `await response.json()`. `mockResponse` mimics just
// that slice of the fetch Response shape so mock and real branches are drop-in
// replacements for each other — no call site needs to change based on USE_MOCK_API.
const MOCK_DELAY_MS = 300

// Small artificial delay so loading states / toast.promise spinners behave the
// same as they would against a real network call.
export const delay = (ms = MOCK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

export async function mockResponse(data, { ok = true, status = ok ? 200 : 400 } = {}) {
    await delay()
    return {
        ok,
        status,
        json: async () => data,
    }
}
