'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const getDistance = (str: string) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const dist = (Math.abs(hash) % 50) / 10 + 0.1
  return dist.toFixed(1)
}

export default function MarketplaceClient({ initialItems }: { initialItems: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Items')

  const filteredItems = useMemo(() => {
    return initialItems.filter(item => {
      // Search filter
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (!matchesSearch) return false

      // Category / Quick filter
      if (activeFilter === 'Free Stuff 🎁') {
        return item.is_free
      }
      if (activeFilter === 'Furniture 🪑') {
        return item.category.toLowerCase().includes('furniture')
      }
      if (activeFilter === 'Electronics 💻') {
        return item.category.toLowerCase().includes('electronic')
      }
      if (activeFilter === 'Tools 🔨') {
        return item.category.toLowerCase().includes('tool')
      }

      return true
    })
  }, [initialItems, searchQuery, activeFilter])

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-sm mt-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-md">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
            </div>
            <input 
              type="text" 
              placeholder="Search marketplace..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface rounded-full py-2.5 pl-12 pr-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm border border-outline-variant/50"
            />
          </div>
          
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-sm w-full md:w-auto">
            <Link href="/marketplace/new" className="bg-black text-white px-md py-2.5 rounded-lg text-label-md font-label-md hover:bg-black/80 transition-colors shadow-sm flex items-center gap-xs whitespace-nowrap">
              <span className="material-symbols-outlined text-[18px]">add</span> List Item
            </Link>
            <div className="h-6 w-px bg-outline-variant mx-1 hidden md:block"></div>
            <button className="bg-surface-container-low text-on-surface px-md py-2.5 rounded-lg text-label-md font-label-md hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/30 flex items-center gap-xs whitespace-nowrap">
              All Categories
            </button>
            <button className="bg-surface-container-low text-on-surface px-md py-2.5 rounded-lg text-label-md font-label-md hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/30 flex items-center gap-xs whitespace-nowrap">
              Any Distance
            </button>
            <button className="bg-surface-container-low text-on-surface w-10 h-10 rounded-lg hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-sm mt-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All Items', 'Free Stuff 🎁', 'Furniture 🪑', 'Electronics 💻', 'Tools 🔨'].map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-md py-1.5 rounded-full text-label-md font-bold whitespace-nowrap shadow-sm transition-colors ${
                activeFilter === filter 
                  ? 'bg-[#0A5C36] text-white border border-[#0A5C36]' 
                  : 'bg-surface-container-low text-on-surface border border-outline-variant/50 hover:bg-surface-container'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-lg mt-md">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-2xl">
            <p className="text-headline-md font-headline-md text-on-surface mb-xs">No items found</p>
            <p className="font-body-md">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredItems.map((item: any) => {
            const imgUrl = item.images && item.images.length > 0 
              ? item.images[0] 
              : `https://picsum.photos/seed/${encodeURIComponent(item.title)}/600/400`
              
            const distance = getDistance(item.id)

            return (
              <div key={item.id} className="bg-white rounded-2xl border border-outline-variant/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                <div className="aspect-[4/3] bg-surface-container relative overflow-hidden">
                  <img src={imgUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {item.is_free ? (
                    <div className="absolute top-sm right-sm px-sm py-[4px] bg-[#A3F4C8] text-[#0A5C36] rounded-full font-bold text-[12px] tracking-wider uppercase shadow-sm">
                      FREE
                    </div>
                  ) : (
                    <div className="absolute top-sm right-sm px-sm py-[4px] bg-black/60 backdrop-blur-md text-white rounded-full font-bold text-[13px] shadow-sm">
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>
                  )}

                  <div className="absolute bottom-sm left-sm flex items-center gap-xs">
                    <div className="bg-white/80 backdrop-blur-sm text-blue-800 px-2 py-[2px] rounded text-[9px] font-black uppercase tracking-wider shadow-sm">
                      {item.category}
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm text-gray-700 px-2 py-[2px] rounded text-[9px] font-black uppercase tracking-wider shadow-sm">
                      {item.condition.replace('_', ' - ')}
                    </div>
                  </div>
                </div>
                
                <div className="p-md flex-1 flex flex-col">
                  <h3 className="text-[16px] font-headline-md text-on-surface mb-1 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-[13px] text-on-surface-variant line-clamp-3 mb-lg flex-1 leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full border border-outline-variant bg-surface-container relative shrink-0">
                        {item.seller.avatar_url ? (
                          <img src={item.seller.avatar_url} alt={item.seller.full_name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[12px] text-on-surface-variant">
                            {item.seller.full_name.charAt(0)}
                          </div>
                        )}
                        {item.seller.is_verified && (
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full shadow-sm">
                            <span className="material-symbols-outlined text-[12px] text-primary block" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-on-surface leading-none">{item.seller.full_name.split(' ')[0]} {item.seller.full_name.split(' ').length > 1 ? item.seller.full_name.split(' ')[1].charAt(0) + '.' : ''}</span>
                        <div className="flex items-center gap-xs text-[10px] text-on-surface-variant mt-0.5">
                          <span className="material-symbols-outlined text-[10px]">location_on</span>
                          <span>{distance} mi away</span>
                        </div>
                      </div>
                    </div>
                    
                    {item.is_free ? (
                      <button className="bg-[#0A5C36] text-white px-md py-1.5 rounded-lg text-[12px] font-bold hover:bg-[#0A5C36]/90 transition-colors shadow-sm">
                        Claim<br/>Item
                      </button>
                    ) : (
                      <button className="bg-black text-white px-md py-2 rounded-lg text-[12px] font-bold hover:bg-black/80 transition-colors shadow-sm">
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
