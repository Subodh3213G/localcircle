import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { deletePost } from '@/app/actions/feed'

type PostType = {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  likes_count: number
  comments_count: number
  author_id: string
  author: {
    full_name: string
    avatar_url: string
    is_verified: boolean
  }
}

export default function PostCard({ post, onDeleted }: { post: PostType, onDeleted?: (id: string) => void }) {
  const { user } = useAppStore()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [isDeleting, setIsDeleting] = useState(false)
  const [shared, setShared] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return
    setIsDeleting(true)
    try {
      await deletePost(post.id)
      if (onDeleted) onDeleted(post.id)
    } catch (err) {
      alert("Failed to delete post")
      setIsDeleting(false)
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch(category) {
      case 'event': return 'bg-secondary-container text-on-secondary-container'
      case 'lost_and_found': return 'bg-tertiary-container text-on-tertiary-container'
      case 'announcement': return 'bg-primary-container text-on-primary-container'
      default: return 'bg-surface-variant text-on-surface-variant'
    }
  }

  const formatCategory = (category: string) => {
    return category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  // Calculate relative time (e.g. "2 hours ago")
  const getRelativeTime = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  if (isDeleting) return null

  return (
    <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant hover:shadow-md transition-shadow relative">
      {user?.id === post.author_id && (
        <button 
          onClick={handleDelete}
          className="absolute top-md right-md p-xs text-on-surface-variant hover:text-error transition-colors"
          title="Delete Post"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      )}

      <div className="flex items-start justify-between mb-sm">
        <div className="flex gap-md">
          {post.author?.avatar_url ? (
            <img alt="Author" className="w-10 h-10 rounded-full border border-outline-variant object-cover" src={post.author.avatar_url}/>
          ) : (
            <div className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center bg-surface-container font-headline-md text-on-surface">
              {post.author?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-xs">
              <p className="text-label-md font-label-md text-on-surface">{post.author?.full_name || 'Unknown Neighbor'}</p>
              {post.author?.is_verified && (
                <span className="material-symbols-outlined text-[16px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }} title="Verified Resident">shield_person</span>
              )}
            </div>
            <p className="text-caption font-caption text-on-surface-variant">{getRelativeTime(post.created_at)}</p>
          </div>
        </div>
        <span className={`${getCategoryBadgeColor(post.category)} px-sm py-[2px] rounded text-caption font-label-md mr-8`}>
          {formatCategory(post.category)}
        </span>
      </div>
      
      <h3 className="text-headline-md font-headline-md text-on-surface mb-xs pr-8">{post.title}</h3>
      <p className="text-body-md font-body-md text-on-surface mb-md whitespace-pre-wrap">{post.content}</p>
      
      <div className="flex items-center justify-between border-t border-outline-variant pt-sm">
        <div className="flex gap-md">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-xs transition-colors text-label-md font-label-md ${isLiked ? 'text-primary' : 'text-on-surface-variant hover:text-secondary'}`}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>thumb_up</span> {likesCount}
          </button>
          <button className="flex items-center gap-xs text-on-surface-variant hover:text-secondary transition-colors text-label-md font-label-md">
            <span className="material-symbols-outlined text-lg">chat_bubble</span> {post.comments_count}
          </button>
        </div>
        <button onClick={handleShare} className="flex items-center gap-xs text-on-surface-variant hover:text-secondary transition-colors text-label-md font-label-md">
          <span className="material-symbols-outlined text-lg">{shared ? 'check' : 'share'}</span> {shared ? 'Copied Link' : 'Share'}
        </button>
      </div>
    </div>
  )
}
