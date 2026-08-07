// Fixtures for the `Order`/`OrderItem` models (GET/POST /api/orders,
// PUT /api/orders/:id). Statuses match the enum app/store/orders/page.jsx
// cycles through: ORDER_PLACED, PROCESSING, SHIPPED, DELIVERED.
import { productMockData } from '@/features/products/api/productMockData'
import { mockAddresses } from '@/features/cart/api/addressMockData'
import { mockUsers } from '@/features/auth/api/authMockData'
import { couponMockData } from '@/features/coupons/api/couponMockData'

const product = (id) => productMockData.find((p) => p.id === id)
const customer = mockUsers[0]
const address = mockAddresses[0]

export const orderMockData = [
    {
        id: 'order_1',
        total: 1078,
        status: 'DELIVERED',
        userId: customer.id,
        addressId: address.id,
        isPaid: true,
        paymentMethod: 'COD',
        isCouponUsed: false,
        coupon: null,
        orderItems: [
            { orderId: 'order_1', productId: 'prod_almond', quantity: 1, price: 549, product: product('prod_almond') },
            { orderId: 'order_1', productId: 'prod_alsi', quantity: 1, price: 169, product: product('prod_alsi') },
        ],
        address,
        user: customer,
        createdAt: '2026-07-15T09:15:03.000Z',
        updatedAt: '2026-07-17T14:20:00.000Z',
    },
    {
        id: 'order_2',
        total: 878.4,
        status: 'PROCESSING',
        userId: customer.id,
        addressId: address.id,
        isPaid: false,
        paymentMethod: 'COD',
        isCouponUsed: true,
        coupon: couponMockData.find((c) => c.code === 'OFF10'),
        orderItems: [
            { orderId: 'order_2', productId: 'prod_kaju', quantity: 1, price: 699, product: product('prod_kaju') },
            { orderId: 'order_2', productId: 'prod_makhana', quantity: 1, price: 249, product: product('prod_makhana') },
        ],
        address,
        user: customer,
        createdAt: '2026-08-01T11:05:00.000Z',
        updatedAt: '2026-08-01T11:05:00.000Z',
    },
    {
        id: 'order_3',
        total: 429,
        status: 'SHIPPED',
        userId: customer.id,
        addressId: address.id,
        isPaid: true,
        paymentMethod: 'STRIPE',
        isCouponUsed: false,
        coupon: null,
        orderItems: [
            { orderId: 'order_3', productId: 'prod_figs', quantity: 1, price: 429, product: product('prod_figs') },
        ],
        address,
        user: customer,
        createdAt: '2026-08-04T16:40:00.000Z',
        updatedAt: '2026-08-05T09:00:00.000Z',
    },
    {
        id: 'order_4',
        total: 1298,
        status: 'ORDER_PLACED',
        userId: customer.id,
        addressId: address.id,
        isPaid: false,
        paymentMethod: 'COD',
        isCouponUsed: false,
        coupon: null,
        orderItems: [
            { orderId: 'order_4', productId: 'prod_pista', quantity: 1, price: 799, product: product('prod_pista') },
            { orderId: 'order_4', productId: 'prod_walnut', quantity: 1, price: 649, product: product('prod_walnut') },
        ],
        address,
        user: customer,
        createdAt: '2026-08-06T10:00:00.000Z',
        updatedAt: '2026-08-06T10:00:00.000Z',
    },
]
