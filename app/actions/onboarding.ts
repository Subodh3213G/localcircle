'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function resolveNeighborhood(lng: number, lat: number) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .rpc('find_neighborhood_by_point', { lng, lat })

  if (error) {
    console.error('Error resolving neighborhood:', error)
    throw new Error('Failed to resolve neighborhood boundaries.')
  }

  return data?.[0] || null
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
