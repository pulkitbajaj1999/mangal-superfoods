'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '@/lib/features/user/userSlice'
import { apiFetch } from '@/lib/apiClient'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state) => state.user.current)

  const [step, setStep] = useState('mobile') // 'mobile', 'otp', 'details'
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  const handleMobileSubmit = async (e) => {
    e.preventDefault()
    if (!mobile.trim() || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    // Check if user already exists in database
    const userRes = await apiFetch(`/api/users?mobile=${mobile}`)
    if (userRes.ok) {
      setError('Mobile number already registered. Please log in instead.')
      toast.error('Mobile number already registered. Please log in instead.')
      return
    }

    try {
      const res = await apiFetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Unable to send OTP')
        toast.error(data.error || 'Unable to send OTP')
        return
      }

      setError('')
      toast.success(data.message || 'OTP sent to your mobile')
      setStep('otp')
    } catch (error) {
      console.error('OTP send error', error)
      setError('Error sending OTP. Please try again.')
      toast.error('Error sending OTP. Please try again.')
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await apiFetch('/api/sms/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid OTP.')
        toast.error(data.error || 'Invalid OTP.')
        return
      }

      setError('')
      toast.success('OTP verified')
      setStep('details')
    } catch (error) {
      console.error('OTP verify error', error)
      setError('OTP verification failed.')
      toast.error('OTP verification failed.')
    }
  }

  const handleDetailsSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!name.trim() || !password.trim()) {
      setError('Please fill in all required fields.')
      toast.error('Please fill in all required fields.')
      return
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.')
        toast.error('Please enter a valid email address.')
        return
      }
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      toast.error('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      toast.error('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      // Create user in database
      const userId = `user_${Date.now()}`
      const res = await apiFetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          name,
          email,
          mobile,
          password,
          role: 'CUSTOMER',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create account')
        toast.error(data.error || 'Failed to create account')
        return
      }

      setError('')
      toast.success('Account created successfully!')

      // Store user in localStorage and Redux
      const newUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        role: data.role,
      }
      localStorage.setItem('store_user', JSON.stringify(newUser))
      dispatch(setUser(newUser))
      
      // Redirect to home
      router.push('/')
    } catch (error) {
      console.error('User creation error', error)
      setError('Error creating account. Please try again.')
      toast.error('Error creating account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm ring-1 ring-slate-200">
        {step === 'mobile' && (
          <>
            <h1 className="text-2xl font-bold mb-6">Signup</h1>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <label className="block">
                <span>Mobile Number</span>
                <input
                  className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter 10-digit mobile"
                  maxLength={10}
                  required
                />
              </label>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Send OTP
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-600">
              Already have an account? <Link href="/login" className="text-green-600 hover:underline">Login</Link>
            </p>
          </>
        )}

        {step === 'otp' && (
          <>
            <h1 className="text-2xl font-bold mb-6">Enter OTP</h1>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <label className="block">
                <span>OTP</span>
                <input
                  className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  maxLength={4}
                  required
                />
              </label>
              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Verify OTP
              </button>
            </form>
          </>
        )}

        {step === 'details' && (
          <>
            <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Full Name</span>
                <input
                  className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Email (optional)</span>
                <input
                  className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email (optional)"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <input
                  className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Confirm Password</span>
                <input
                  className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-slate-400"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}