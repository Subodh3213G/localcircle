'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getActiveAlerts() {
  const supabase = createClient()
  
  // Note: RLS automatically scopes this to the user's neighborhood.
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      author:profiles(id, full_name, avatar_url, is_verified)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching alerts:', error)
    throw new Error('Failed to load active alerts.')
  }
  
  return data
}

export async function createUrgentAlert(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const severity = (formData.get('severity') as string) || 'warning'
  
  // Fetch neighborhood
  const { data: profile } = await supabase
    .from('profiles')
    .select('neighborhood_id, is_verified')
    .eq('id', user.id)
    .single()

  if (!profile?.neighborhood_id) throw new Error('User not assigned to a neighborhood')
  if (!profile.is_verified) throw new Error('Only verified residents can create urgent alerts')

  const { error } = await supabase
    .from('alerts')
    .insert({
      author_id: user.id,
      neighborhood_id: profile.neighborhood_id,
      title,
      description,
      severity,
      status: 'active'
    })

  if (error) {
    console.error('Error creating alert:', error)
    throw new Error('Failed to broadcast alert.')
  }
  
  revalidatePath('/alerts')
  return { success: true }
}
