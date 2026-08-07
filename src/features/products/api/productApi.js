// Products API — talks to `mangal-superfoods-backend`'s /api/products routes,
// or serves productMockData.js when USE_MOCK_API is on (src/config/api.js).
//
// Every export returns the same shape apiFetch() would: a Response-like object
// with `.ok` / `.json()`, so call sites don't need to branch on the toggle.
import { apiFetch } from '@/services/apiClient'
import { mockResponse } from '@/services/mockUtils'
import { USE_MOCK_API } from '@/config/api'
import { productMockData } from './productMockData'

// In-memory copy so mock create/update/delete persist for the session
// without touching the fixture module itself.
let mockProducts = productMockData.map((product) => ({ ...product }))

const readFormFields = (formData) => {
    const fields = {}
    for (const [key, value] of formData.entries()) {
        if (key === 'images') continue
        fields[key] = value
    }
    return fields
}

const newImagesFromFormData = (formData) =>
    formData.getAll('images').map((file) =>
        typeof File !== 'undefined' && file instanceof File ? URL.createObjectURL(file) : file
    )

export async function getProducts() {
    if (USE_MOCK_API) return mockResponse(mockProducts)
    return apiFetch('/api/products')
}

export async function getProductById(productId) {
    if (USE_MOCK_API) {
        const product = mockProducts.find((p) => p.id === productId)
        return mockResponse(product ?? { error: 'Product not found' }, { ok: !!product, status: product ? 200 : 404 })
    }
    return apiFetch(`/api/products/${productId}`)
}

// `body` is a FormData instance (name, description, mrp, price, category, images[])
// — see app/admin/add-product/page.jsx.
export async function createProduct(formData) {
    if (USE_MOCK_API) {
        const fields = readFormFields(formData)
        const now = new Date().toISOString()
        const product = {
            id: `prod_${Date.now()}`,
            name: fields.name,
            description: fields.description,
            mrp: Number(fields.mrp),
            price: Number(fields.price),
            category: fields.category,
            images: newImagesFromFormData(formData).length
                ? newImagesFromFormData(formData)
                : ['https://picsum.photos/seed/new-product/600/600'],
            inStock: true,
            rating: [],
            createdAt: now,
            updatedAt: now,
        }
        mockProducts = [product, ...mockProducts]
        return mockResponse(product, { status: 201 })
    }
    return apiFetch('/api/products', { method: 'POST', body: formData })
}

// `payload` is either a plain object (JSON — e.g. { inStock }) or a FormData
// instance (full edit form, see app/admin/manage-product/page.jsx).
export async function updateProduct(productId, payload) {
    if (USE_MOCK_API) {
        const existing = mockProducts.find((p) => p.id === productId)
        if (!existing) return mockResponse({ error: 'Product not found' }, { ok: false, status: 404 })

        let updates
        if (typeof FormData !== 'undefined' && payload instanceof FormData) {
            const fields = readFormFields(payload)
            const existingImages = fields.existingImages ? JSON.parse(fields.existingImages) : existing.images
            const uploadedImages = newImagesFromFormData(payload)
            updates = {
                ...fields,
                mrp: fields.mrp !== undefined ? Number(fields.mrp) : existing.mrp,
                price: fields.price !== undefined ? Number(fields.price) : existing.price,
                inStock: fields.inStock !== undefined ? fields.inStock === 'true' || fields.inStock === true : existing.inStock,
                images: [...existingImages, ...uploadedImages],
            }
        } else {
            updates = payload
        }

        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
        mockProducts = mockProducts.map((p) => (p.id === productId ? updated : p))
        return mockResponse(updated)
    }
    return apiFetch(`/api/products/${productId}`, {
        method: 'PUT',
        ...(typeof FormData !== 'undefined' && payload instanceof FormData
            ? { body: payload }
            : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    })
}

export async function deleteProduct(productId) {
    if (USE_MOCK_API) {
        const existed = mockProducts.some((p) => p.id === productId)
        mockProducts = mockProducts.filter((p) => p.id !== productId)
        return mockResponse({ success: true }, { ok: existed, status: existed ? 200 : 404 })
    }
    return apiFetch(`/api/products/${productId}`, { method: 'DELETE' })
}
