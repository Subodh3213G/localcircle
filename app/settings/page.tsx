'use client'

import { useAppStore } from '@/store/useAppStore'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, setUser } = useAppStore()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-lg w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-md mb-md border-b border-outline-variant pb-md">
        <span className="material-symbols-outlined text-[32px] text-primary">settings</span>
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Settings</h1>
          <p className="text-body-md text-on-surface-variant">Manage your account and preferences.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg shadow-sm">
        <h2 className="text-headline-md font-headline-md text-on-surface mb-md">Account Information</h2>
        
        {user ? (
          <div className="flex flex-col gap-md">
            <div className="flex items-center gap-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-outline-variant flex items-center justify-center text-primary font-headline-lg">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.full_name.charAt(0)
                )}
              </div>
              <div>
                <p className="text-headline-sm font-headline-md text-on-surface">{user.full_name}</p>
                <p className="text-body-md text-on-surface-variant">{user.is_verified ? 'Verified Resident' : 'Unverified Resident'}</p>
              </div>
            </div>
            
            <div className="pt-md border-t border-outline-variant flex items-center justify-between">
              <span className="text-body-md text-on-surface">Sign out of your account on this device.</span>
              <button 
                onClick={handleSignOut}
                className="bg-error-container text-on-error-container px-md py-sm rounded-lg font-label-md hover:bg-error-container/80 transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-lg">
            <p className="text-body-md text-on-surface-variant mb-md">You are not signed in.</p>
            <button 
              onClick={() => router.push('/login')}
              className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md hover:bg-primary/90 transition-colors shadow-sm"
            >
              Sign In
            </button>
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg shadow-sm opacity-60">
        <h2 className="text-headline-md font-headline-md text-on-surface mb-md">Notification Preferences</h2>
        <p className="text-body-md text-on-surface-variant mb-md">Coming soon: Manage your email and push notification settings.</p>
      </div>
    </div>
  )
}
