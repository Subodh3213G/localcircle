'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAppStore } from '@/store/useAppStore'

export default function NeighborhoodTrust() {
  const { currentNeighborhood } = useAppStore()
  const [stats, setStats] = useState({ verified: 0, total: 0, percentage: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentNeighborhood) return

    const fetchStats = async () => {
      const supabase = createClient()
      
      // Get all profiles in the current neighborhood
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('neighborhood_id', currentNeighborhood.id)

      if (error) {
        console.error('Error fetching trust stats:', error)
      } else if (data) {
        const total = data.length
        const verified = data.filter((p: any) => p.is_verified === true).length
        const percentage = total > 0 ? Math.round((verified / total) * 100) : 0
        setStats({ verified, total, percentage })
      }
      setLoading(false)
    }

    fetchStats()
  }, [currentNeighborhood])

  if (!currentNeighborhood) return null

  return (
    <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-sm relative overflow-hidden border border-outline-variant/30">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#0A5C36]/10 rounded-full blur-xl"></div>
      <div className="flex items-center gap-sm text-[#0A5C36]">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
        <h3 className="text-[14px] font-bold text-on-surface tracking-wide">Neighborhood Trust</h3>
      </div>
      
      {loading ? (
        <div className="flex flex-col gap-sm mt-xs animate-pulse">
          <div className="h-10 bg-surface-container w-24 rounded-md"></div>
          <div className="h-1.5 bg-surface-container w-full rounded-full mt-sm"></div>
          <div className="h-3 bg-surface-container w-3/4 rounded-sm mt-xs"></div>
        </div>
      ) : (
        <>
          <div className="flex items-end gap-sm mt-xs">
            <span className="text-[48px] font-extrabold text-on-surface leading-none tracking-tight">{stats.verified}</span>
            <span className="text-[14px] font-semibold text-on-surface-variant pb-1.5">Verified Residents</span>
          </div>
          
          <div className="w-full bg-surface-container h-2 rounded-full mt-sm overflow-hidden">
            <div 
              className="bg-[#0A5C36] h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
          
          <p className="text-[12px] font-medium text-on-surface-variant mt-xs">
            {stats.percentage}% of {currentNeighborhood.name} residents are verified.
          </p>
        </>
      )}
    </div>
  )
}
