// Ratings API — /api/ratings (GET/POST), or ratingMockData.js when
// USE_MOCK_API is on.
import { apiFetch } from '@/services/apiClient'
import { mockResponse } from '@/services/mockUtils'
import { USE_MOCK_API } from '@/config/api'
import { ratingMockData } from './ratingMockData'

let mockRatings = ratingMockData.map((rating) => ({ ...rating }))

// `productId` is optional — omit it to fetch every rating.
export async function getRatings(productId) {
    if (USE_MOCK_API) {
        const ratings = productId ? mockRatings.filter((r) => r.productId === productId) : mockRatings
        return mockResponse(ratings)
    }
    return apiFetch(productId ? `/api/ratings?productId=${productId}` : '/api/ratings')
}

export async function createRating(ratingData) {
    if (USE_MOCK_API) {
        const rating = { id: `rating_${Date.now()}`, createdAt: new Date().toISOString(), ...ratingData }
        mockRatings = [...mockRatings, rating]
        return mockResponse(rating, { status: 201 })
    }
    return apiFetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData),
    })
}
