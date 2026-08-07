// Addresses API — /api/addresses (GET/POST), or addressMockData.js when
// USE_MOCK_API is on.
import { apiFetch } from '@/services/apiClient'
import { mockResponse } from '@/services/mockUtils'
import { USE_MOCK_API } from '@/config/api'
import { mockAddresses } from './addressMockData'

let mockAddressList = mockAddresses.map((address) => ({ ...address }))

export async function getAddresses() {
    if (USE_MOCK_API) return mockResponse(mockAddressList)
    return apiFetch('/api/addresses')
}

export async function createAddress(addressData) {
    if (USE_MOCK_API) {
        const address = { id: `addr_${Date.now()}`, createdAt: new Date().toISOString(), ...addressData }
        mockAddressList = [...mockAddressList, address]
        return mockResponse(address, { status: 201 })
    }
    return apiFetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData),
    })
}
