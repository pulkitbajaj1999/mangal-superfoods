// Coupons API — /api/coupons (GET, and POST once app/admin/coupons/page.jsx's
// handleAddCoupon stub is implemented — see root CLAUDE.md), or
// couponMockData.js when USE_MOCK_API is on.
import { apiFetch } from '@/services/apiClient'
import { mockResponse } from '@/services/mockUtils'
import { USE_MOCK_API } from '@/config/api'
import { couponMockData } from './couponMockData'

export async function getCoupons() {
    if (USE_MOCK_API) return mockResponse(couponMockData)
    return apiFetch('/api/coupons')
}
