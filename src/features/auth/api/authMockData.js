// Fixtures for the `User` model + the mobile/OTP/password auth flow
// (see root CLAUDE.md "Auth is implemented" section). `password` here is
// plaintext purely so the mock login can compare against something — the
// real backend hashes it with crypto.scryptSync and never exposes it via
// GET /api/users?mobile=..., so mock reads strip it too (see authApi.js).
//
// Use these mobile numbers to sign in against the mock API:
//   9999999999 / password123  -> CUSTOMER (no special access)
//   9777777777 / password123  -> ADMIN (access to admin dashboard and store management)

export const mockUsers = [
    {
        id: 'user_customer_1',
        name: 'Aditi Sharma',
        email: 'aditi.sharma@example.com',
        mobile: '9999999999',
        password: 'password123',
        role: 'CUSTOMER',
        createdAt: '2026-05-01T10:00:00.000Z',
    },
    {
        id: 'user_admin_1',
        name: 'Admin User',
        email: 'admin@mangalsuperfoods.example.com',
        mobile: '9777777777',
        password: 'password123',
        role: 'ADMIN',
        createdAt: '2026-04-01T10:00:00.000Z',
    },
]

// Any of these mobile numbers accept this as a "valid" OTP in mock mode.
export const MOCK_OTP = '1234'
