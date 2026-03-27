'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '@/lib/features/user/userSlice'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state) => state.user.current)

  const [profile, setProfile] = useState({ fullName: '', email: '', mobile: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/signup')
    } else {
      setIsLoading(true)
      // Load profile data from saved user
      setProfile({
        fullName: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
      })
      setIsLoading(false)
    }
  }, [user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile.fullName.trim()) {
      setError('Full name is required.')
      return
    }

    setIsLoading(true)
    try {
      // Update user in database
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          name: profile.fullName,
          email: profile.email || user.email,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update profile')
        toast.error(data.error || 'Failed to update profile')
        setIsLoading(false)
        return
      }

      // Update local state
      const updatedUser = {
        ...user,
        name: profile.fullName,
        email: profile.email || user.email,
      }
      localStorage.setItem('store_user', JSON.stringify(updatedUser))
      dispatch(updateProfile({
        name: profile.fullName,
        email: updatedUser.email,
      }))
      setError('')
      toast.success('Profile updated successfully!')
      setIsLoading(false)
      router.push('/')
    } catch (error) {
      console.error('Profile update error', error)
      setError('Error updating profile. Please try again.')
      toast.error('Error updating profile. Please try again.')
      setIsLoading(false)
    }
  }

  if (!user || isLoading) return null

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-bold mb-2">My Profile</h1>
        
        {/* Display Current Profile Info */}
        <div className="mb-6 p-4 bg-slate-100 rounded-lg">
          <div className="mb-3">
            <p className="text-sm text-slate-600">Full Name</p>
            <p className="text-lg font-semibold">{user.name}</p>
          </div>
          <div className="mb-3">
            <p className="text-sm text-slate-600">Mobile</p>
            <p className="text-lg">{user.mobile}</p>
          </div>
          {user.email && (
            <div>
              <p className="text-sm text-slate-600">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Full Name</span>
            <input
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="Email (optional)"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-slate-400"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}