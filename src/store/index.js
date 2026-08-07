import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '@/features/cart/cartSlice'
import productReducer from '@/features/products/productSlice'
import addressReducer from '@/features/cart/addressSlice'
import ratingReducer from '@/features/reviews/ratingSlice'
import userReducer from '@/features/auth/userSlice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            cart: cartReducer,
            product: productReducer,
            address: addressReducer,
            rating: ratingReducer,
            user: userReducer,
        },
    })
}