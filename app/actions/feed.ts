'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getFeedPosts(limit = 20) {
  const supabase = createClient()
  
  // Note: RLS automatically scopes this to the user's neighborhood.
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(id, full_name, avatar_url, is_verified)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching feed:', error)
    throw new Error('Failed to load neighborhood feed.')
  }
  return data
}

import { checkContentModeration } from '@/utils/ai-moderation'

export async function createPost(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const category = formData.get('category') as string

  // Run AI Moderation
  const moderation = await checkContentModeration(`${title}\n${content}`)
  if (!moderation.isSafe) {
    throw new Error(`Content Blocked: ${moderation.reason}`)
  }

  // We fetch the neighborhood_id from the user's profile to explicitly set it,
  // even though RLS checks this during insertion.
  const { data: profile } = await supabase
    .from('profiles')
    .select('neighborhood_id')
    .eq('id', user.id)
    .single()

  if (!profile?.neighborhood_id) {
    throw new Error('User not assigned to a neighborhood')
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      neighborhood_id: profile.neighborhood_id,
      title,
      content,
      category,
    })

  if (error) {
    console.error('Error creating post:', error)
    throw new Error('Failed to create post.')
  }
  
  revalidatePath('/feed')
  return { success: true }
}

export async function deletePost(postId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id) // Ensure only author can delete

  if (error) {
    console.error('Error deleting post:', error)
    throw new Error('Failed to delete post.')
  }
  
  revalidatePath('/')
  return { success: true }
}
