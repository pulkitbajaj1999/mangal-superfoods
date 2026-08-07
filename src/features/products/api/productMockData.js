// Fixtures shaped like the mangal-superfoods-backend `Product` model + its
// embedded `rating` relation, as returned by GET /api/products and
// GET /api/products/:id. No `store`/`storeId` — the Store model was removed
// as part of the single-vendor pivot (see root CLAUDE.md).
//
// Images are plain URL strings (matching real S3-hosted responses), not
// `next/image` static imports — several call sites (e.g.
// app/admin/manage-product/page.jsx's edit-product flow) do `typeof img ===
// 'string'` checks to tell an existing image apart from a newly-picked File,
// so a static-import object would silently break there. We still source the
// pictures from local files under src/mock/assets/superfoods/ (real product
// photos, swapped in from src/mock/assets.js) but unwrap them to their
// built `.src` URL before putting them in the fixtures below.
import almondImg from '@/mock/assets/superfoods/almond.jpg'
import kajuImg from '@/mock/assets/superfoods/kaju.jpeg'
import makhanaImg from '@/mock/assets/superfoods/makhana.jpeg'
import alsiImg from '@/mock/assets/superfoods/alsi.jpg'
import datesImg from '@/mock/assets/superfoods/dates.avif'
import kishmishImg from '@/mock/assets/superfoods/kishmish.webp'
import pistaImg from '@/mock/assets/superfoods/pista.webp'
import walnutImg from '@/mock/assets/superfoods/wallnut.jpeg'
import figsImg from '@/mock/assets/superfoods/figs.webp'
import profilePic1 from '@/mock/assets/profile_pic1.jpg'
import profilePic2 from '@/mock/assets/profile_pic2.jpg'
import profilePic3 from '@/mock/assets/profile_pic3.jpg'

const reviewerAvatars = [profilePic1.src, profilePic2.src, profilePic3.src]
const reviewer = (name, img) => ({ name, image: reviewerAvatars[(img - 1) % reviewerAvatars.length] })

const makeRatings = (productId, entries) =>
    entries.map(([rating, review, name, img], index) => ({
        id: `rating_${productId}_${index + 1}`,
        rating,
        review,
        user: reviewer(name, img),
        productId,
        createdAt: '2026-06-15T09:30:00.000Z',
        updatedAt: '2026-06-15T09:30:00.000Z',
    }))

export const productMockData = [
    {
        id: 'prod_almond',
        name: 'Premium California Almonds',
        description: 'Hand-picked, naturally air-dried California almonds. Rich in protein, fibre and healthy fats — a wholesome everyday snack with no added preservatives.',
        mrp: 649,
        price: 549,
        images: [almondImg.src],
        category: 'Food & Drink',
        inStock: true,
        rating: makeRatings('prod_almond', [
            [5, 'Fresh and crunchy, exactly as described. Will order again.', 'Kavita Rao', 1],
            [4.5, 'Good quality almonds, packaging kept them fresh.', 'Rohit Sharma', 2],
            [4, 'Slightly pricey but worth it for the quality.', 'Meena Iyer', 3],
        ]),
        createdAt: '2026-07-29T09:15:25.000Z',
        updatedAt: '2026-07-29T09:15:25.000Z',
    },
    {
        id: 'prod_kaju',
        name: 'Whole Cashew Nuts (Kaju W240)',
        description: 'Premium grade W240 whole cashews, roasted lightly to bring out their natural sweetness. Perfect for snacking or gifting.',
        mrp: 799,
        price: 699,
        images: [kajuImg.src],
        category: 'Food & Drink',
        inStock: true,
        rating: makeRatings('prod_kaju', [
            [5, 'Best cashews I have bought online. Big and creamy.', 'Ankit Verma', 4],
            [5, 'Great for festive gifting, loved by everyone.', 'Priya Nair', 5],
        ]),
        createdAt: '2026-07-28T09:15:25.000Z',
        updatedAt: '2026-07-28T09:15:25.000Z',
    },
    {
        id: 'prod_makhana',
        name: 'Roasted Makhana (Foxnuts) - Peri Peri',
        description: 'Light, crunchy fox nuts roasted with a tangy peri-peri seasoning. A guilt-free snack that is naturally gluten-free and low in calories.',
        mrp: 299,
        price: 249,
        images: [makhanaImg.src],
        category: 'Food & Drink',
        inStock: true,
        rating: makeRatings('prod_makhana', [
            [4, 'Nice and crispy, seasoning is not too spicy.', 'Sanjay Gupta', 6],
            [4.5, 'My kids love this as an evening snack.', 'Divya Menon', 7],
            [3.5, 'Good but the pack size could be bigger.', 'Farhan Khan', 8],
        ]),
        createdAt: '2026-07-27T09:15:25.000Z',
        updatedAt: '2026-07-27T09:15:25.000Z',
    },
    {
        id: 'prod_alsi',
        name: 'Roasted Flax Seeds (Alsi)',
        description: 'Roasted flax seeds packed with Omega-3 fatty acids and fibre. Sprinkle over salads, smoothies or rotis for a nutrition boost.',
        mrp: 199,
        price: 169,
        images: [alsiImg.src],
        category: 'Beauty & Health',
        inStock: true,
        rating: makeRatings('prod_alsi', [
            [4.5, 'Good quality, roasted well and not bitter.', 'Kavita Rao', 1],
            [4, 'Buying this regularly for my morning smoothie.', 'Rohit Sharma', 2],
        ]),
        createdAt: '2026-07-26T09:15:25.000Z',
        updatedAt: '2026-07-26T09:15:25.000Z',
    },
    {
        id: 'prod_dates',
        name: 'Seedless Dates (Khajur)',
        description: 'Soft, naturally sweet seedless dates — a healthy alternative to refined sugar. Great in desserts, shakes or eaten on their own.',
        mrp: 349,
        price: 299,
        images: [datesImg.src],
        category: 'Food & Drink',
        inStock: true,
        rating: makeRatings('prod_dates', [
            [5, 'Very soft and fresh, no artificial sweetness.', 'Meena Iyer', 3],
            [4.5, 'Great for making energy balls at home.', 'Ankit Verma', 4],
            [5, 'Kids finish the pack in two days!', 'Priya Nair', 5],
        ]),
        createdAt: '2026-07-25T09:15:25.000Z',
        updatedAt: '2026-07-25T09:15:25.000Z',
    },
    {
        id: 'prod_kishmish',
        name: 'Golden Raisins (Kishmish)',
        description: 'Sun-dried golden raisins with a naturally sweet, tangy flavour. A pantry staple for baking, cooking or straight-up snacking.',
        mrp: 229,
        price: 189,
        images: [kishmishImg.src],
        category: 'Food & Drink',
        inStock: false,
        rating: makeRatings('prod_kishmish', [
            [4, 'Good quality, slightly smaller in size than expected.', 'Sanjay Gupta', 6],
            [4.5, 'Nice and juicy, will reorder once back in stock.', 'Divya Menon', 7],
        ]),
        createdAt: '2026-07-24T09:15:25.000Z',
        updatedAt: '2026-07-24T09:15:25.000Z',
    },
    {
        id: 'prod_pista',
        name: 'Roasted & Salted Pistachios',
        description: 'Premium roasted pistachios, lightly salted. High in protein and antioxidants — ideal for a healthy mid-day snack.',
        mrp: 899,
        price: 799,
        images: [pistaImg.src],
        category: 'Food & Drink',
        inStock: true,
        rating: makeRatings('prod_pista', [
            [5, 'Fresh, well-roasted and perfectly salted.', 'Farhan Khan', 8],
            [4.5, 'A bit expensive but the quality justifies it.', 'Kavita Rao', 1],
            [5, 'Best pistachios I have had in a long time.', 'Rohit Sharma', 2],
        ]),
        createdAt: '2026-07-23T09:15:25.000Z',
        updatedAt: '2026-07-23T09:15:25.000Z',
    },
    {
        id: 'prod_walnut',
        name: 'Kashmiri Walnut Kernels (Akhrot)',
        description: 'Light-coloured, premium Kashmiri walnut kernels — rich, buttery and packed with Omega-3s. Ideal for daily consumption.',
        mrp: 749,
        price: 649,
        images: [walnutImg.src],
        category: 'Food & Drink',
        inStock: true,
        rating: makeRatings('prod_walnut', [
            [4.5, 'Very fresh kernels, minimal broken pieces.', 'Meena Iyer', 3],
            [4, 'Good quality, though a little pricey.', 'Ankit Verma', 4],
        ]),
        createdAt: '2026-07-22T09:15:25.000Z',
        updatedAt: '2026-07-22T09:15:25.000Z',
    },
    {
        id: 'prod_figs',
        name: 'Dried Turkish Figs (Anjeer)',
        description: 'Naturally sweet, soft dried figs sourced from Turkey. A rich source of fibre, calcium and iron.',
        mrp: 499,
        price: 429,
        images: [figsImg.src],
        category: 'Food & Drink',
        inStock: true,
        rating: makeRatings('prod_figs', [
            [5, 'Soft, juicy and not overly sweet. Loved it.', 'Priya Nair', 5],
            [4, 'Good quality figs, would buy again.', 'Sanjay Gupta', 6],
            [4.5, 'Great for making homemade anjeer barfi.', 'Divya Menon', 7],
        ]),
        createdAt: '2026-07-21T09:15:25.000Z',
        updatedAt: '2026-07-21T09:15:25.000Z',
    },
]
