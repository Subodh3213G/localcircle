'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAppStore } from '@/store/useAppStore'

// Note: In a real app, you'd use a toast library like sonner or react-hot-toast.
// Here we're using a custom UI overlay driven by global state for demonstration.

export default function RealtimeAlerts() {
  const { currentNeighborhood, addUrgentAlert, urgentAlerts } = useAppStore()
  const supabase = createClient()

  useEffect(() => {
    if (!currentNeighborhood?.id) return

    const channel = supabase
      .channel('public:alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `neighborhood_id=eq.${currentNeighborhood.id}`
        },
        (payload) => {
          const newAlert = payload.new as any
          addUrgentAlert(newAlert)
          // You would typically trigger a UI toast here.
          console.warn('Urgent Alert Received!', newAlert)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentNeighborhood, supabase, addUrgentAlert])

  // Display the latest unread alert as a global floating toast
  const latestAlert = urgentAlerts[0]

  if (!latestAlert) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-destructive text-destructive-foreground p-4 rounded-2xl shadow-ambient border-2 border-destructive-foreground/20 flex items-start space-x-3">
        <span className="material-symbols-outlined text-[24px] flex-shrink-0 mt-0.5">warning</span>
        <div className="flex-1">
          <h4 className="font-bold mb-1">{latestAlert.title}</h4>
          <p className="text-sm opacity-90 line-clamp-2">{latestAlert.description}</p>
        </div>
        <button 
          onClick={() => useAppStore.setState(s => ({ urgentAlerts: s.urgentAlerts.slice(1) }))}
          className="p-1 hover:bg-black/10 rounded-lg transition-colors"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
