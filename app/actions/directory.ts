'use server'

import { createClient } from '@/utils/supabase/server'

export async function getBusinesses(limit = 20) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('is_verified', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching businesses:', error)
    throw new Error('Failed to load business directory.')
  }
  return data
}
