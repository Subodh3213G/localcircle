'use client'

import { useEffect, useState } from 'react'
import { getFeedPosts } from '@/app/actions/feed'
import PostCard from './post-card'

export default function FeedList() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getFeedPosts()
        setPosts(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadPosts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-xl">
        <span className="material-symbols-outlined animate-spin text-[32px] text-[#0A5C36]">refresh</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-md rounded-xl text-center">
        <p className="font-bold mb-xs">Failed to load feed</p>
        <p className="text-body-md opacity-90">{error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-2xl">
        <p className="text-headline-md font-headline-md text-on-surface mb-xs">No posts yet</p>
        <p className="font-body-md">Be the first to share something with your neighborhood!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-lg">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          onDeleted={(id) => setPosts(posts.filter(p => p.id !== id))} 
        />
      ))}
    </div>
  )
}
