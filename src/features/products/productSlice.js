import { createSlice } from '@reduxjs/toolkit'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
        bestSelling: []
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        setBestSelling: (state, action) => {
            state.bestSelling = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        }
    }
})

export const { setProduct, setBestSelling, clearProduct } = productSlice.actions

export default productSlice.reducer