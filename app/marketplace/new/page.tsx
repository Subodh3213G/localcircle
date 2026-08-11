'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { createClient } from '@/utils/supabase/client'

export default function NewMarketplaceItemPage() {
  const router = useRouter()
  const { user } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('good')
  const [category, setCategory] = useState('Furniture')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.neighborhood_id) {
      alert("You must be logged in and part of a neighborhood to post an item.")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    
    const { error } = await supabase.from('marketplace_items').insert({
      neighborhood_id: user.neighborhood_id,
      seller_id: user.id,
      title,
      price: parseFloat(price) || 0,
      is_free: parseFloat(price) === 0 || price === '',
      condition,
      category: category,
      images: imageUrl ? [imageUrl] : [],
      description,
      status: 'available'
    })

    if (error) {
      console.error(error)
      alert('Failed to post item.')
      setIsSubmitting(false)
    } else {
      router.push('/marketplace')
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
          <h1 className="text-headline-lg font-headline-lg text-on-surface">List an Item</h1>
          <p className="text-body-md text-on-surface-variant">Sell or give away items to your neighbors.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-outline-variant rounded-2xl p-lg shadow-sm flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-bold text-on-surface">Item Title</label>
          <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Wooden Bookshelf" className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="flex flex-col gap-xs">
            <label className="text-label-md font-bold text-on-surface">Price (₹)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01" placeholder="0.00" className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all" />
            <p className="text-[11px] text-on-surface-variant italic mt-1">Leave at ₹0 for <span className="font-bold">Free Stuff 🎁</span></p>
          </div>
          
          <div className="flex flex-col gap-xs">
            <label className="text-label-md font-bold text-on-surface">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all">
              <option value="Furniture">Furniture 🪑</option>
              <option value="Electronics">Electronics 💻</option>
              <option value="Tools">Tools 🔨</option>
              <option value="General">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="text-label-md font-bold text-on-surface">Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)} className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all">
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <label className="text-label-md font-bold text-on-surface">Item Photo</label>
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
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the item, dimensions, pickup details..." className="px-md py-sm rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-[#0A5C36] focus:ring-1 focus:ring-[#0A5C36] outline-none transition-all" />
        </div>

        <button type="submit" disabled={isSubmitting} className="mt-sm bg-[#0A5C36] text-white px-lg py-3 rounded-xl font-bold hover:bg-[#0A5C36]/90 transition-colors shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Listing...' : 'List Item'}
        </button>
      </form>
    </div>
  )
}
