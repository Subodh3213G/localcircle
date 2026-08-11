'use client'

import { useEffect, useState } from 'react'
import { incrementAlertView } from '@/app/actions/increment-alert-view'

export default function AlertViewTracker({ alertId, initialViewCount }: { alertId: string, initialViewCount: number }) {
  const [viewCount, setViewCount] = useState(initialViewCount || 0)

  useEffect(() => {
    // Only increment once per session to avoid spamming
    const viewedAlerts = JSON.parse(sessionStorage.getItem('viewedAlerts') || '[]')
    
    if (!viewedAlerts.includes(alertId)) {
      // Optimistically increment locally
      setViewCount(prev => prev + 1)
      
      // Send to server
      incrementAlertView(alertId).catch(console.error)
      
      // Save to session storage so we don't count it again on re-renders or navigation back
      viewedAlerts.push(alertId)
      sessionStorage.setItem('viewedAlerts', JSON.stringify(viewedAlerts))
    }
  }, [alertId])

  return (
    <div className="flex items-center gap-xs text-primary font-body-md">
      <span className="material-symbols-outlined text-[16px]">visibility</span> Viewed by {viewCount.toLocaleString()} residents
    </div>
  )
}
