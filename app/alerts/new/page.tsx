'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { createClient } from '@/utils/supabase/client'

export default function NewAlertPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState('advisory')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.neighborhood_id) {
      alert("You must be logged in and part of a neighborhood to post an alert.")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    
    const { error } = await supabase.from('alerts').insert({
      neighborhood_id: user.neighborhood_id,
      author_id: user.id,
      title,
      severity,
      description,
      status: 'active'
    })

    if (error) {
      console.error(error)
      alert('Failed to post alert.')
      setIsSubmitting(false)
    } else {
      router.push('/alerts')
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
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Report Urgent Alert</h1>
          <p className="text-body-md text-on-surface-variant">Notify your neighbors about critical issues.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg shadow-sm flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-label-md text-on-surface">Alert Title</label>
          <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Water main break on Main St" className="px-md py-sm rounded-lg border border-outline bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-label-md text-on-surface">Severity</label>
          <select value={severity} onChange={e => setSeverity(e.target.value)} className="px-md py-sm rounded-lg border border-outline bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
            <option value="advisory">Advisory</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-label-md text-on-surface">Description</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Provide details about the situation..." className="px-md py-sm rounded-lg border border-outline bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
        </div>

        <button type="submit" disabled={isSubmitting} className="mt-sm bg-error text-on-error px-lg py-sm rounded-lg font-label-md hover:bg-error/90 transition-colors shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Reporting...' : 'Submit Alert'}
        </button>
      </form>
    </div>
  )
}
