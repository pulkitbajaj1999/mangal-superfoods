import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
    name: 'user',
    initialState: {
        current: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.current = action.payload
        },
        login: (state, action) => {
            state.current = action.payload
        },
        logout: (state) => {
            state.current = null
        },
        updateProfile: (state, action) => {
            if (state.current) {
                state.current = { ...state.current, ...action.payload }
            }
        },
    },
})

export const { setUser, login, logout, updateProfile } = userSlice.actions
export default userSlice.reducer
