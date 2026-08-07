// Fixtures for the `Coupon` model (GET/POST /api/coupons). Consumed by
// features/cart/components/OrderSummary.jsx (code lookup at checkout) and
// app/admin/coupons/page.jsx (listing — add/delete there are still bare
// stubs per root CLAUDE.md, so there's no mock create/delete here yet).
export const couponMockData = [
    { code: 'NEW20', description: '20% Off for New Users', discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: '2026-12-31T00:00:00.000Z', createdAt: '2026-01-10T08:35:31.000Z' },
    { code: 'NEW10', description: '10% Off for New Users', discount: 10, forNewUser: true, forMember: false, isPublic: false, expiresAt: '2026-12-31T00:00:00.000Z', createdAt: '2026-01-10T08:35:50.000Z' },
    { code: 'OFF20', description: '20% Off for All Users', discount: 20, forNewUser: false, forMember: false, isPublic: false, expiresAt: '2026-12-31T00:00:00.000Z', createdAt: '2026-01-10T08:42:00.000Z' },
    { code: 'OFF10', description: '10% Off for All Users', discount: 10, forNewUser: false, forMember: false, isPublic: false, expiresAt: '2026-12-31T00:00:00.000Z', createdAt: '2026-01-10T08:42:21.000Z' },
    { code: 'PLUS10', description: '10% Off for Members', discount: 10, forNewUser: false, forMember: true, isPublic: false, expiresAt: '2027-03-06T00:00:00.000Z', createdAt: '2026-01-10T11:38:20.000Z' },
]
