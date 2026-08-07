'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '@/store'
import { setUser } from '@/features/auth/userSlice'

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('store_user')
      if (storedUser) {
        try {
          storeRef.current.dispatch(setUser(JSON.parse(storedUser)))
        } catch (error) {
          console.error('Failed to hydrate user from localStorage', error)
        }
      }
    }
  }, [])

  return <Provider store={storeRef.current}>{children}</Provider>
}