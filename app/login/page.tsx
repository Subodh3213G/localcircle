'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const { setUser } = useAppStore()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const supabase = createClient()

    try {
      if (isSignUp) {
        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: email.split('@')[0] }
          }
        })
        if (error) throw error

        setErrorMsg('Sign up successful! Please check your email or sign in.')
        setIsSignUp(false)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          setUser({
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            is_verified: profile.is_verified,
            neighborhood_id: profile.neighborhood_id
          })
        }
        
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)]">
      <div className="bg-surface-container-lowest p-xl rounded-2xl shadow-md w-full max-w-md border border-outline-variant">
        <div className="text-center mb-lg">
          <span className="material-symbols-outlined text-[48px] text-primary mb-sm">waving_hand</span>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Welcome to LocalCircle</h1>
          <p className="text-body-md text-on-surface-variant mt-xs">Connect with your neighborhood.</p>
        </div>

        {errorMsg && (
          <div className={`p-sm mb-md rounded-lg text-label-md ${errorMsg.includes('successful') ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="text-label-md font-label-md text-on-surface">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-md py-sm rounded-lg border border-outline bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="neighbor@example.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-xs">
            <label className="text-label-md font-label-md text-on-surface">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-md py-sm rounded-lg border border-outline bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-on-primary py-sm rounded-lg font-label-md mt-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-lg text-center">
          <p className="text-body-md text-on-surface-variant">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp)
                setErrorMsg('')
              }} 
              className="text-primary font-label-md ml-xs hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
