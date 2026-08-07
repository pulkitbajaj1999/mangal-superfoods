'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '@/features/auth/userSlice'
import { apiFetch } from '@/services/apiClient'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state) => state.user.current)

  const [step, setStep] = useState('mobile') // 'mobile', 'otp', 'password'
  const [loginMethod, setLoginMethod] = useState('otp') // 'otp' | 'password'
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fetchedUser, setFetchedUser] = useState(null)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('store_user') : null
    if (stored) {
      dispatch(setUser(JSON.parse(stored)))
    }
  }, [dispatch])

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

    // Check if user exists in database
    const userRes = await apiFetch(`/api/users?mobile=${mobile}`)
    if (!userRes.ok) {
      setError('Mobile number not registered. Please sign up first.')
      toast.error('Mobile number not registered. Please sign up first.')
      return
    }

    const userData = await userRes.json()
    setFetchedUser(userData)

    if (loginMethod === 'password') {
      if (!password || password.length < 6) {
        setError('Please enter a valid password (at least 6 characters).')
        toast.error('Please enter a valid password (at least 6 characters).')
        return
      }

      try {
        const authRes = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, password }),
        })

        const authData = await authRes.json()
        if (!authRes.ok || !authData.success) {
          setError(authData.error || 'Invalid credentials.')
          toast.error(authData.error || 'Invalid credentials.')
          return
        }

        setError('')
        toast.success('Login successful!')
        const userSafe = authData.user
        localStorage.setItem('store_user', JSON.stringify(userSafe))
        dispatch(setUser(userSafe))
        router.push('/')
        return
      } catch (error) {
        console.error('Password login error', error)
        setError('Error during login. Please try again.')
        toast.error('Error during login. Please try again.')
        return
      }
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
      toast.success('OTP verified, logging in...')

      if (fetchedUser && fetchedUser.mobile === mobile) {
        localStorage.setItem('store_user', JSON.stringify(fetchedUser))
        dispatch(setUser(fetchedUser))
        router.push('/')
      }
    } catch (error) {
      console.error('OTP verify error', error)
      setError('OTP verification failed.')
      toast.error('OTP verification failed.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm ring-1 ring-slate-200">
        {step === 'mobile' && (
          <>
            <h1 className="text-2xl font-bold mb-6">Login</h1>
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-2 rounded-md ${loginMethod === 'otp' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                OTP
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className={`flex-1 py-2 rounded-md ${loginMethod === 'password' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                Password
              </button>
            </div>
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

              {loginMethod === 'password' && (
                <label className="block">
                  <span>Password</span>
                  <input
                    className="mt-1 block w-full border border-slate-300 rounded px-3 py-2"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </label>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                {loginMethod === 'otp' ? 'Send OTP' : 'Continue'}
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-600">
              Does not have an account ? <Link href="/signup" className="text-green-600 hover:underline">Signup</Link>
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
                Login
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-slate-600">
              Not a user? <Link href="/signup" className="text-green-600 hover:underline">Signup</Link>
            </p>
          </>
        )}

      </div>
    </div>
  )
}
