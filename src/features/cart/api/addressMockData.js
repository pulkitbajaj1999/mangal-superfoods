// Fixtures for the `Address` model (GET/POST /api/addresses), shaped to match
// the fields AddressModal.jsx actually collects — addressLine1/2, pincode,
// landmark, etc. (not the older street/zip/country/phone shape still referenced
// by features/orders/components/OrderItem.jsx, which predates this form).
import { mockUsers } from '@/features/auth/api/authMockData'

export const mockAddresses = [
    {
        id: 'addr_1',
        userId: mockUsers[0].id,
        name: 'Aditi Sharma',
        mobile: '9999999999',
        pincode: '400001',
        addressLine1: 'Flat 302, Sunrise Apartments',
        addressLine2: 'Near Marine Lines Station',
        landmark: 'Opposite City Hospital',
        city: 'Mumbai',
        state: 'Maharashtra',
        createdAt: '2026-06-01T08:30:00.000Z',
    },
]
