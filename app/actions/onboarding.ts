'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resolveNeighborhood(lng: number, lat: number) {
  const supabase = createClient()
  
  // 1. Try to find an existing precise polygon boundary
  const { data, error } = await supabase
    .rpc('find_neighborhood_by_point', { lng, lat })

  if (!error && data && data.length > 0) {
    return data[0]
  }

  // 2. If no exact polygon, reverse geocode to generate a dynamic neighborhood
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`, {
      headers: { 'User-Agent': 'LocalCircleApp/1.0' }
    })
    const geo = await res.json()
    
    const address = geo.address || {}
    const name = address.suburb || address.neighbourhood || address.village || address.town || address.city || 'Unknown Area'
    const city = address.city || address.county || address.state_district || 'Unknown City'
    const state = address.state || 'Unknown State'
    
    if (name === 'Unknown Area') return null

    const slug = `${name}-${city}-${state}`.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // 3. Auto-create this neighborhood in the database with a roughly 2km bounding box
    const { data: newHood, error: insertError } = await supabase
      .rpc('create_dynamic_neighborhood', {
        p_name: name,
        p_slug: slug,
        p_city: city,
        p_state: state,
        p_lng: lng,
        p_lat: lat,
        p_box_size: 0.015 // Approx 1.5 - 2km radius
      })

    if (insertError) {
      console.error('Error auto-creating neighborhood:', insertError)
      return null
    }

    return newHood?.[0] || null

  } catch (err) {
    console.error('Reverse geocoding failed:', err)
    return null
  }
}

export async function updateUserLocation(neighborhoodId: string, lng: number, lat: number) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({ 
      neighborhood_id: neighborhoodId,
      home_location: `POINT(${lng} ${lat})`
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating profile location:', error)
    throw new Error('Failed to update location.')
  }
  
  revalidatePath('/')
  return { success: true }
}
