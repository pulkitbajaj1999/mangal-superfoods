import { createSlice } from '@reduxjs/toolkit'
import { productDummyData, allitemsDummyData, bestSellingDummyData } from '@/assets/assets'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: allitemsDummyData,
        bestSelling: bestSellingDummyData
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        }
    }
})

export const { setProduct, clearProduct } = productSlice.actions

export default productSlice.reducer