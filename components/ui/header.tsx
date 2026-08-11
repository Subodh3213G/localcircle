'use client'

import { useAppStore } from '@/store/useAppStore'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const { currentNeighborhood, user } = useAppStore()
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="fixed top-0 w-full h-16 z-50 bg-on-secondary/80 backdrop-blur-xl border-b border-outline-variant flex items-center justify-between px-margin-desktop">
      <div className="flex items-center gap-md">
        <img alt="LocalCircle Brand Logo" className="w-8 h-8 rounded-full object-cover" src="/logo-icon.png"/>
        <span className="font-headline-md text-headline-md text-on-surface">LocalCircle</span>
      </div>
      
      <div className="flex items-center gap-md">
        <div className="flex items-center">
          {showSearch && (
            <input 
              type="text" 
              placeholder="Search neighborhood..." 
              className="px-md py-xs rounded-l-lg border-y border-l border-outline bg-surface text-on-surface focus:border-primary outline-none transition-all w-48 text-label-md"
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          )}
          <button 
            onClick={() => setShowSearch(!showSearch)} 
            className={`p-xs text-on-surface-variant hover:text-secondary transition-colors ${showSearch ? 'bg-surface border-y border-r border-outline rounded-r-lg' : ''}`}
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="p-xs text-on-surface-variant hover:text-secondary transition-colors relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-md z-50">
              <h4 className="text-label-md font-label-md text-on-surface mb-sm pb-xs border-b border-outline-variant">Notifications</h4>
              <div className="flex flex-col gap-sm">
                <div className="text-body-sm text-on-surface-variant p-sm hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                  <span className="font-label-md text-on-surface">Priya Patel</span> posted a new urgent alert in your area.
                </div>
                <div className="text-body-sm text-on-surface-variant p-sm hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer">
                  <span className="font-label-md text-on-surface">Rohan Sharma</span> commented on your post.
                </div>
              </div>
            </div>
          )}
        </div>
        
        {user ? (
          <div className="flex items-center gap-sm pl-md border-l border-outline-variant">
            <div className="text-right">
              <p className="text-label-md font-label-md text-on-surface leading-none">{user.full_name}</p>
              <p className="text-caption font-caption text-on-surface-variant">
                {user.is_verified ? 'Verified Resident' : 'Resident'}
              </p>
            </div>
            {user.avatar_url ? (
              <img alt="Profile" className="w-8 h-8 rounded-full border border-outline-variant object-cover" src={user.avatar_url}/>
            ) : (
              <div className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center bg-primary/20 text-primary font-label-md">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="ml-md bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md font-label-md hover:bg-primary/90 transition-colors shadow-sm block">
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
