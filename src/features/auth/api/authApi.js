// Auth API — covers everything app/(auth)/login, app/(auth)/signup and
// app/profile call: /api/users (GET by mobile/POST/PUT), /api/auth/login,
// /api/sms/send + /api/sms/verify. Falls back to authMockData.js when
// USE_MOCK_API is on (src/config/api.js).
import { apiFetch } from '@/services/apiClient'
import { mockResponse } from '@/services/mockUtils'
import { USE_MOCK_API } from '@/config/api'
import { mockUsers, MOCK_OTP } from './authMockData'

let mockUserList = mockUsers.map((user) => ({ ...user }))

// Never hand the mock password back out — the real backend only ever
// stores/returns a scrypt hash, never the plaintext.
const withoutPassword = (user) => {
    if (!user) return user
    const { password, ...safe } = user
    return safe
}

export async function getUserByMobile(mobile) {
    if (USE_MOCK_API) {
        const user = mockUserList.find((u) => u.mobile === mobile)
        return mockResponse(user ? withoutPassword(user) : { error: 'User not found' }, { ok: !!user, status: user ? 200 : 404 })
    }
    return apiFetch(`/api/users?mobile=${mobile}`)
}

export async function createUser(userData) {
    if (USE_MOCK_API) {
        if (mockUserList.some((u) => u.mobile === userData.mobile)) {
            return mockResponse({ error: 'Mobile number already registered' }, { ok: false, status: 409 })
        }
        const user = { role: 'CUSTOMER', ...userData, createdAt: new Date().toISOString() }
        mockUserList = [...mockUserList, user]
        return mockResponse(withoutPassword(user), { status: 201 })
    }
    return apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    })
}

// `updates` is `{ id, name, email }` — see app/profile/page.jsx.
export async function updateUser(updates) {
    if (USE_MOCK_API) {
        const existing = mockUserList.find((u) => u.id === updates.id)
        if (!existing) return mockResponse({ error: 'User not found' }, { ok: false, status: 404 })
        const updated = { ...existing, ...updates }
        mockUserList = mockUserList.map((u) => (u.id === updates.id ? updated : u))
        return mockResponse(withoutPassword(updated))
    }
    return apiFetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    })
}

export async function login(mobile, password) {
    if (USE_MOCK_API) {
        const user = mockUserList.find((u) => u.mobile === mobile && u.password === password)
        if (!user) return mockResponse({ success: false, error: 'Invalid credentials.' }, { ok: false, status: 401 })
        return mockResponse({ success: true, user: withoutPassword(user) })
    }
    return apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
    })
}

export async function sendOtp(mobile) {
    if (USE_MOCK_API) {
        return mockResponse({ message: `OTP sent to your mobile (use ${MOCK_OTP} in mock mode)` })
    }
    return apiFetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
    })
}

export async function verifyOtp(mobile, otp) {
    if (USE_MOCK_API) {
        if (otp !== MOCK_OTP) return mockResponse({ success: false, error: 'Invalid OTP.' }, { ok: false, status: 400 })
        return mockResponse({ success: true })
    }
    return apiFetch('/api/sms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
    })
}
