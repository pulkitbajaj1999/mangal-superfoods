/**
 * Resolves the first usable image URL for a product.
 *
 * Product images arrive in two shapes depending on the data source: plain URL
 * strings from the backend, and imported static image objects (`{ src }`) from
 * the mock fixtures. Products may also have an empty or missing `images` array
 * (e.g. an order placed for a product whose images were never uploaded).
 *
 * @returns {string|null} a URL usable as an `<img>`/`next/image` src, or `null`
 *   when the product has no image and a placeholder should be rendered.
 */
export const getProductImageSrc = (product) => {
    const first = product?.images?.[0];
    if (!first) return null;
    if (typeof first === 'string') return first || null;
    return first.src || null;
}
