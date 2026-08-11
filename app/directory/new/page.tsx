'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { createClient } from '@/utils/supabase/client'

export default function NewBusinessPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('Plumbing')
  const [phone, setPhone] = useState('')
  const [mapUrl, setMapUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.neighborhood_id) {
      alert("You must be logged in and part of a neighborhood to add a business.")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    
    const { error } = await supabase.from('businesses').insert({
      neighborhood_id: user.neighborhood_id,
      owner_id: user.id,
      name,
      category,
      phone,
      map_url: mapUrl,
      image_url: imageUrl,
      description,
      address: 'Bandra West, Mumbai', // Mock address for now
      is_verified: true,
    })

    if (error) {
      console.error(error)
      alert('Failed to add business.')
      setIsSubmitting(false)
    } else {
      router.push('/directory')
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
          <h1 className="text-headline-lg font-headline-lg text-on-surface">Add Business</h1>
          <p className="text-body-md text-on-surface-variant">List a local business in the neighborhood directory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg shadow-sm flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-bold text-on-surface">Business Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Joe's Cafe" className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <label className="text-label-md font-bold text-on-surface">Category</label>
            <select required value={category} onChange={e => setCategory(e.target.value)} className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all">
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Tutors">Tutors</option>
              <option value="Landscaping">Landscaping</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Pet Care">Pet Care</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-xs">
            <label className="text-label-md font-bold text-on-surface">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all" />
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-bold text-on-surface">Google Maps Link (Optional)</label>
          <input type="url" value={mapUrl} onChange={e => setMapUrl(e.target.value)} placeholder="https://maps.google.com/..." className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all" />
        </div>

        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-bold text-on-surface">Business Photo</label>
          <div className="flex items-center gap-md">
            <label className="cursor-pointer bg-surface-container-low text-on-surface border border-outline-variant/50 px-md py-sm rounded-lg hover:bg-surface-container transition-colors flex items-center gap-xs font-bold text-[13px] shadow-sm">
              <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
              Choose Image
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => setImageUrl(event.target?.result as string);
                  reader.readAsDataURL(file);
                }} 
                className="hidden" 
              />
            </label>
            
            {imageUrl && (
              <div className="h-12 w-16 relative rounded-md overflow-hidden border border-outline-variant shadow-sm">
                <img src={imageUrl} className="object-cover w-full h-full" alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => setImageUrl('')} 
                  className="absolute top-0 right-0 bg-black/60 text-white w-5 h-5 flex items-center justify-center rounded-bl-md hover:bg-black transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">close</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-bold text-on-surface">Description</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the business..." className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all" />
        </div>

        <button type="submit" disabled={isSubmitting} className="mt-sm bg-[#0A5C36] text-white px-lg py-3 rounded-xl font-bold hover:bg-[#0A5C36]/90 transition-colors shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Adding...' : 'Add Business'}
        </button>
      </form>
    </div>
  )
}
