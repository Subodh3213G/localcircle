'use client'

import { useState, useRef } from 'react'
import { createPost } from '@/app/actions/feed'
import { useAppStore } from '@/store/useAppStore'

export default function CreatePost() {
  const [loading, setLoading] = useState(false)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [hasLocation, setHasLocation] = useState(false)
  const { user } = useAppStore()
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    
    try {
      await createPost(formData)
      e.currentTarget.reset()
      setHasPhoto(false)
      setHasLocation(false)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while posting.')
    } finally {
      setLoading(false)
    }
  }

  const toggleLocation = () => {
    if (!hasLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(() => {
          setHasLocation(true)
        }, () => alert("Could not get your live location."))
      } else {
        alert("Geolocation is not supported by your browser.")
      }
    } else {
      setHasLocation(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant focus-within:border-secondary transition-colors relative">
      <div className="flex gap-md">
        {user?.avatar_url ? (
          <img alt="User" className="w-10 h-10 rounded-full object-cover" src={user.avatar_url}/>
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container font-headline-md text-on-surface">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        )}
        <div className="flex-1 flex flex-col">
          <input 
            type="text" 
            name="title"
            required
            className="bg-transparent border-none outline-none text-headline-md font-headline-md text-on-surface placeholder:text-on-surface-variant mb-xs" 
            placeholder="Share with your neighborhood..."
          />
          <textarea 
            name="content"
            required
            className="bg-transparent border-none outline-none text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant resize-none" 
            placeholder="What's happening nearby?" 
            rows={2}
          ></textarea>
          
          {error && (
            <div className="mt-sm p-sm bg-error-container text-on-error-container rounded-lg text-label-sm font-label-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]">security</span>
              {error}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-md pt-md border-t border-outline-variant">
        <div className="flex gap-sm">
          <div className="flex items-center gap-xs">
            <select name="category" className="text-label-md font-label-md bg-transparent text-on-surface-variant outline-none cursor-pointer">
              <option value="general">General</option>
              <option value="announcement">Announcement</option>
              <option value="lost_and_found">Lost & Found</option>
              <option value="event">Event</option>
            </select>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={(e) => setHasPhoto(!!e.target.files?.length)} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center gap-xs px-sm py-xs rounded hover:bg-surface-container transition-colors text-label-md font-label-md ${hasPhoto ? 'text-primary' : 'text-secondary'}`}
          >
            <span className="material-symbols-outlined text-lg">{hasPhoto ? 'check_circle' : 'image'}</span> {hasPhoto ? 'Photo Added' : 'Photo'}
          </button>
          
          <button 
            type="button" 
            onClick={toggleLocation}
            className={`flex items-center gap-xs px-sm py-xs rounded hover:bg-surface-container transition-colors text-label-md font-label-md ${hasLocation ? 'text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-lg">{hasLocation ? 'location_on' : 'add_location'}</span> {hasLocation ? 'Location Pinned' : 'Live Location'}
          </button>
          
          <button type="button" className="flex items-center gap-xs px-sm py-xs rounded hover:bg-surface-container text-on-surface-variant transition-colors text-label-md font-label-md">
            <span className="material-symbols-outlined text-lg">campaign</span> Alert
          </button>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="bg-secondary text-on-secondary px-lg py-sm rounded-lg text-label-md font-label-md hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post to Neighbors'}
        </button>
      </div>
    </form>
  )
}
