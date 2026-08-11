'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { createClient } from '@/utils/supabase/client'

export default function NewGroupPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.neighborhood_id) {
      alert("You must be logged in and part of a neighborhood to create a group.")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    
    const { error } = await supabase.from('groups').insert({
      neighborhood_id: user.neighborhood_id,
      created_by: user.id,
      name,
      is_private: privacy === 'private',
      description
    })

    if (error) {
      console.error(error)
      alert('Failed to create group.')
      setIsSubmitting(false)
    } else {
      router.push('/groups')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-lg w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-md mb-md border-b border-outline-variant pb-md">
        <button onClick={() => router.back()} className="p-xs hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Create Private Group</h1>
          <p className="text-body-md text-on-surface-variant">Start a community around a shared interest.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg shadow-sm flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-label-md text-on-surface">Group Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Weekend Hikers" className="px-md py-sm rounded-lg border border-outline bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-label-md text-on-surface">Privacy</label>
          <select value={privacy} onChange={e => setPrivacy(e.target.value)} className="px-md py-sm rounded-lg border border-outline bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
            <option value="private">Private (Invite Only)</option>
            <option value="public">Public (Open to Neighborhood)</option>
          </select>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-label-md text-on-surface">Description</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="What is this group about?" className="px-md py-sm rounded-lg border border-outline bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </div>

        <button type="submit" disabled={isSubmitting} className="mt-sm bg-secondary text-on-secondary px-lg py-sm rounded-lg font-label-md hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  )
}
