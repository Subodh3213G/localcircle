'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAppStore } from '@/store/useAppStore'
import { useRouter, usePathname } from 'next/navigation'

import LocationPrompt from '@/components/onboarding/location-prompt'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, user, setCurrentNeighborhood } = useAppStore()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Fetch profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (profile) {
          setUser({
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            is_verified: profile.is_verified,
            neighborhood_id: profile.neighborhood_id
          })
          
          if (profile.neighborhood_id) {
            const { data: neighborhood } = await supabase.from('neighborhoods').select('*').eq('id', profile.neighborhood_id).single()
            if (neighborhood) {
              setCurrentNeighborhood({
                id: neighborhood.id,
                name: neighborhood.name,
                slug: neighborhood.slug,
                city: neighborhood.city,
                state: neighborhood.state
              })
            }
          }
        }
      } else {
        setUser(null)
        if (pathname !== '/login') {
          router.push('/login')
        }
      }
      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/login')
      } else if (session && event === 'SIGNED_IN') {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (profile) {
          setUser({
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            is_verified: profile.is_verified,
            neighborhood_id: profile.neighborhood_id
          })
          
          if (profile.neighborhood_id) {
            const { data: neighborhood } = await supabase.from('neighborhoods').select('*').eq('id', profile.neighborhood_id).single()
            if (neighborhood) {
              setCurrentNeighborhood({
                id: neighborhood.id,
                name: neighborhood.name,
                slug: neighborhood.slug,
                city: neighborhood.city,
                state: neighborhood.state
              })
            }
          }
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router, setUser])

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-6">
        <div className="relative flex items-center justify-center w-28 h-28">
          {/* Outer fast spinning ring */}
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" style={{ animationDuration: '1s' }}></div>
          {/* Middle reverse spinning ring */}
          <div className="absolute inset-2 rounded-full border-b-4 border-secondary animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
          {/* Inner slow spinning ring */}
          <div className="absolute inset-4 rounded-full border-l-4 border-tertiary animate-spin" style={{ animationDuration: '2s' }}></div>
          
          {/* Pulsing center icon */}
          <div className="bg-surface-container rounded-full w-14 h-14 flex items-center justify-center shadow-[0_0_15px_rgba(0,210,135,0.5)] animate-pulse overflow-hidden">
            <img src="/logo-icon.png" alt="LocalCircle Logo" className="w-14 h-14 object-cover" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-headline-sm font-headline-sm text-on-surface bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
            LocalCircle
          </p>
          <p className="text-caption font-caption text-on-surface-variant tracking-widest uppercase">
            Verifying Identity...
          </p>
        </div>
      </div>
    )
  }

  // If not logged in and not on login page, render nothing while redirecting
  if (!user && pathname !== '/login') {
    return null
  }

  // If on login page, hide Header and Sidebar for cleaner UI
  if (pathname === '/login') {
    return (
      <div className="w-full min-h-screen bg-background">
        {children}
      </div>
    )
  }

  // Strictly block the entire app if the user hasn't verified their location yet
  if (user && !user.neighborhood_id) {
    return (
      <div className="w-full min-h-screen bg-background flex flex-col pt-16">
        <LocationPrompt />
      </div>
    )
  }

  return <>{children}</>
}
