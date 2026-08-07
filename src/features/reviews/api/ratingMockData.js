// Standalone fixtures for the `Rating` model (GET/POST /api/ratings), for
// call sites that fetch ratings on their own rather than reading the
// `rating` array embedded on a product (see features/products/api/productMockData.js).
// Flattened from that same embedded data so the two stay consistent.
import { productMockData } from '@/features/products/api/productMockData'

export const ratingMockData = productMockData.flatMap((product) =>
    product.rating.map((rating) => ({
        ...rating,
        product: { id: product.id, name: product.name, category: product.category },
    }))
)
