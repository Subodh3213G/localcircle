'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMarketplaceItems(limit = 30) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('marketplace_items')
    .select(`
      *,
      seller:profiles(id, full_name, avatar_url, is_verified)
    `)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching marketplace items:', error)
    throw new Error('Failed to load marketplace.')
  }
  return data
}

export async function createMarketplaceItem(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const is_free = formData.get('is_free') === 'on'
  const condition = formData.get('condition') as string || 'good'

  const { data: profile } = await supabase
    .from('profiles')
    .select('neighborhood_id')
    .eq('id', user.id)
    .single()

  if (!profile?.neighborhood_id) throw new Error('User not assigned to a neighborhood')

  const { error } = await supabase
    .from('marketplace_items')
    .insert({
      seller_id: user.id,
      neighborhood_id: profile.neighborhood_id,
      title,
      description,
      category,
      price,
      is_free,
      condition,
      status: 'available'
    })

  if (error) {
    console.error('Error creating item:', error)
    throw new Error('Failed to list item.')
  }
  
  revalidatePath('/marketplace')
  return { success: true }
}
