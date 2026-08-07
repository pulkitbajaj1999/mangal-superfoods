// Orders API — /api/orders (GET/POST) + /api/orders/:id (PUT), or
// orderMockData.js when USE_MOCK_API is on.
import { apiFetch } from '@/services/apiClient'
import { mockResponse } from '@/services/mockUtils'
import { USE_MOCK_API } from '@/config/api'
import { orderMockData } from './orderMockData'
import { productMockData } from '@/features/products/api/productMockData'
import { mockAddresses } from '@/features/cart/api/addressMockData'
import { mockUsers } from '@/features/auth/api/authMockData'

let mockOrders = orderMockData.map((order) => ({ ...order }))

// `userId` is optional — omit it to fetch every order (store/orders/page.jsx),
// pass it to scope to one customer (app/(public)/orders/page.jsx).
export async function getOrders(userId) {
    if (USE_MOCK_API) {
        const orders = userId ? mockOrders.filter((o) => o.userId === userId) : mockOrders
        return mockResponse(orders)
    }
    return apiFetch(userId ? `/api/orders?userId=${userId}` : '/api/orders')
}

export async function createOrder(orderData) {
    if (USE_MOCK_API) {
        const now = new Date().toISOString()
        const id = `order_${Date.now()}`
        const address = mockAddresses.find((a) => a.id === orderData.addressId) ?? null
        const user = mockUsers.find((u) => u.id === orderData.userId) ?? null
        const order = {
            id,
            total: orderData.total,
            status: 'ORDER_PLACED',
            userId: orderData.userId,
            addressId: orderData.addressId,
            isPaid: false,
            paymentMethod: orderData.paymentMethod,
            isCouponUsed: orderData.isCouponUsed,
            coupon: orderData.isCouponUsed ? orderData.coupon : null,
            orderItems: orderData.orderItems.map((item) => ({
                orderId: id,
                ...item,
                product: productMockData.find((p) => p.id === item.productId) ?? null,
            })),
            address,
            user,
            createdAt: now,
            updatedAt: now,
        }
        mockOrders = [order, ...mockOrders]
        return mockResponse(order, { status: 201 })
    }
    return apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
    })
}

export async function updateOrderStatus(orderId, status) {
    if (USE_MOCK_API) {
        const existing = mockOrders.find((o) => o.id === orderId)
        if (!existing) return mockResponse({ error: 'Order not found' }, { ok: false, status: 404 })
        const updated = { ...existing, status, updatedAt: new Date().toISOString() }
        mockOrders = mockOrders.map((o) => (o.id === orderId ? updated : o))
        return mockResponse(updated)
    }
    return apiFetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    })
}
