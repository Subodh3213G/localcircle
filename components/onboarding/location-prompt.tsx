'use client'

import { useState } from 'react'
import { resolveNeighborhood, updateUserLocation } from '@/app/actions/onboarding'
import { useAppStore } from '@/store/useAppStore'
import { createClient } from '@/utils/supabase/client'

export default function LocationPrompt() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentNeighborhood, user, setUser } = useAppStore()

  const handleSetMockLocation = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('neighborhoods').select('*').eq('slug', 'bandra-west-mumbai').single()
    if (data) {
      setCurrentNeighborhood({ id: data.id, name: data.name, slug: data.slug })
      if (user) {
        await supabase.from('profiles').update({ neighborhood_id: data.id }).eq('id', user.id)
        setUser({ ...user, neighborhood_id: data.id })
      }
    }
    setLoading(false)
  }

  const handleVerifyLocation = async () => {
    setLoading(true)
    setError(null)

    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const neighborhood = await resolveNeighborhood(longitude, latitude)
          
          if (neighborhood) {
            setCurrentNeighborhood({ id: neighborhood.neighborhood_id, name: neighborhood.neighborhood_name, slug: neighborhood.neighborhood_slug })
            await updateUserLocation(neighborhood.neighborhood_id, longitude, latitude)
          } else {
            setError('Your location is outside our currently supported neighborhoods. Please check back later!')
          }
        } catch (err: any) {
          setError(err.message || 'Failed to verify location.')
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error(error)
        setError('Location access was denied. We require location access to verify your residency.')
        setLoading(false)
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-md">
      <div className="bg-surface rounded-2xl max-w-md w-full p-xl shadow-ambient flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mb-md">
          <span className="material-symbols-outlined text-[32px] text-on-primary-container">location_on</span>
        </div>
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-sm">Welcome to your Neighborhood</h1>
        <p className="text-body-md font-body-md text-on-surface-variant mb-lg">
          LocalCircle is a hyper-local network. We need to verify your location to connect you with your verified neighbors.
        </p>

        {error && (
          <div className="p-sm mb-md bg-error-container text-on-error-container rounded-lg text-label-md w-full">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-sm w-full">
          <button 
            onClick={handleVerifyLocation}
            disabled={loading}
            className="w-full flex items-center justify-center py-sm px-lg bg-primary text-on-primary font-label-md rounded-lg hover:bg-primary/90 transition-all disabled:opacity-70 shadow-sm h-12"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[20px] mr-2 animate-spin">refresh</span>
                Locating...
              </>
            ) : (
              'Verify My Physical Location'
            )}
          </button>

          {error && (
            <button 
              onClick={handleSetMockLocation}
              className="w-full flex items-center justify-center py-sm px-lg bg-surface text-secondary font-label-md rounded-lg border border-outline hover:bg-surface-container transition-all h-12"
            >
              Use Mock Location (Bandra West)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
