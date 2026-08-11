import Link from 'next/link'
import { getBusinesses } from '@/app/actions/directory'

// Helper for deterministic random stats
const getStats = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  const rating = 4.0 + (Math.abs(hash) % 10) / 10
  const recommendations = (Math.abs(hash) % 50) + 12
  return { rating: rating.toFixed(1), recommendations }
}

export default async function DirectoryPage() {
  const businesses = await getBusinesses()

  return (
    <div className="flex flex-col gap-xl w-full max-w-6xl mx-auto pb-xl">
      {/* Hero Banner */}
      <div className="bg-[#F6F8FA] rounded-[24px] p-xl md:px-16 md:py-20 flex flex-col items-center text-center shadow-sm border border-outline-variant/30">
        <h1 className="text-[42px] md:text-[56px] font-extrabold text-on-surface tracking-tight mb-2 leading-tight">
          Find Trusted Locals.
        </h1>
        <p className="text-body-lg text-on-surface-variant mb-lg max-w-2xl">
          Discover services vetted and recommended by your neighbors.
        </p>

        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mb-md">
          <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant text-[22px]">search</span>
          </div>
          <input 
            type="text" 
            placeholder="Find a trusted plumber, electrician, or tutor..." 
            className="w-full bg-white rounded-full py-4 pl-12 pr-32 text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/30 shadow-sm border border-outline-variant/50"
          />
          <button className="absolute right-2 top-2 bottom-2 bg-black text-white px-lg rounded-full font-bold hover:bg-black/80 transition-colors shadow-sm">
            Search
          </button>
        </div>

        {/* Trending Tags */}
        <div className="flex items-center gap-sm text-[12px] font-bold text-on-surface-variant/80 uppercase tracking-wider flex-wrap justify-center">
          <span>TRENDING:</span>
          <button className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full capitalize tracking-normal font-semibold hover:bg-blue-100 transition-colors">Emergency Plumber</button>
          <button className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full capitalize tracking-normal font-semibold hover:bg-blue-100 transition-colors">Math Tutor</button>
          <button className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full capitalize tracking-normal font-semibold hover:bg-blue-100 transition-colors">Lawn Care</button>
        </div>
      </div>

      {/* Categories Row */}
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-bold text-on-surface">Categories</h2>
          <button className="text-[#0A5C36] font-bold text-[14px] flex items-center gap-xs hover:underline">
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
          {[
            { name: 'Plumbing', icon: 'plumbing', color: 'bg-green-100 text-green-700' },
            { name: 'Electrical', icon: 'electrical_services', color: 'bg-orange-100 text-orange-700' },
            { name: 'Tutors', icon: 'school', color: 'bg-purple-100 text-purple-700' },
            { name: 'Landscaping', icon: 'yard', color: 'bg-red-100 text-red-700' },
            { name: 'Cleaning', icon: 'cleaning_services', color: 'bg-blue-100 text-blue-700' },
            { name: 'Pet Care', icon: 'pets', color: 'bg-slate-200 text-slate-700' },
          ].map((cat) => (
            <button key={cat.name} className="bg-white rounded-2xl p-md border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center gap-sm h-28 group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined">{cat.icon}</span>
              </div>
              <span className="text-[13px] font-bold text-on-surface">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-xl items-start">
        
        {/* Left Column: Featured Listings */}
        <div className="flex-1 w-full flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <h2 className="text-[24px] font-bold text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-[#0A5C36]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
              Featured Listings
            </h2>
            <Link href="/directory/new" className="text-on-surface-variant hover:text-on-surface font-bold text-[14px] flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">add</span> Add Business
            </Link>
          </div>

          <div className="flex flex-col gap-lg mt-2">
            {businesses.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-2xl">
                <p className="text-headline-md font-headline-md text-on-surface mb-xs">No businesses listed yet</p>
                <p className="font-body-md">Be the first to list your local business!</p>
              </div>
            ) : (
              businesses.map((business: any) => {
                const stats = getStats(business.id)
                // Default image if missing
                const imgUrl = business.image_url || `https://picsum.photos/seed/${encodeURIComponent(business.name)}/400/300`

                return (
                  <div key={business.id} className="bg-white rounded-2xl border border-outline-variant/60 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row overflow-hidden group">
                    {/* Left Image */}
                    <div className="w-full sm:w-1/3 aspect-video sm:aspect-auto relative border-l-4 border-[#0A5C36]">
                      <img src={imgUrl} alt={business.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    
                    {/* Right Content */}
                    <div className="p-lg flex-1 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-md mb-xs">
                        <h3 className="text-[20px] font-bold text-on-surface leading-tight group-hover:text-primary transition-colors">{business.name}</h3>
                        <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-[12px] font-bold flex items-center gap-1 shrink-0 border border-amber-200/50">
                          <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                          {stats.rating}
                        </div>
                      </div>
                      
                      <p className="text-[14px] text-on-surface-variant line-clamp-2 mb-md leading-relaxed">
                        {business.description}
                      </p>
                      
                      <div className="flex items-center gap-xs text-[12px] font-semibold text-[#006A60] bg-[#006A60]/10 w-fit px-3 py-1.5 rounded-full mb-lg">
                        <span className="material-symbols-outlined text-[16px]">groups</span>
                        Recommended by {stats.recommendations} Neighbors
                      </div>
                      
                      <div className="flex items-center gap-sm mt-auto flex-wrap">
                        <button className="bg-black text-white px-xl py-2.5 rounded-lg text-[13px] font-bold hover:bg-black/80 transition-colors shadow-sm flex-1 sm:flex-none text-center">
                          Contact
                        </button>
                        {business.phone && (
                          <button className="bg-white text-on-surface border border-outline-variant px-lg py-2.5 rounded-lg text-[13px] font-bold hover:bg-surface-container transition-colors shadow-sm flex items-center justify-center gap-xs flex-1 sm:flex-none">
                            <span className="material-symbols-outlined text-[18px]">call</span> Call
                          </button>
                        )}
                        {business.website && (
                          <a href={business.website} target="_blank" rel="noreferrer" className="bg-white text-on-surface border border-outline-variant px-lg py-2.5 rounded-lg text-[13px] font-bold hover:bg-surface-container transition-colors shadow-sm flex items-center justify-center gap-xs flex-1 sm:flex-none">
                            <span className="material-symbols-outlined text-[18px]">language</span> Website
                          </a>
                        )}
                        {business.map_url && (
                          <a href={business.map_url} target="_blank" rel="noreferrer" className="bg-white text-on-surface border border-outline-variant px-lg py-2.5 rounded-lg text-[13px] font-bold hover:bg-surface-container transition-colors shadow-sm flex items-center justify-center gap-xs flex-1 sm:flex-none">
                            <span className="material-symbols-outlined text-[18px]">map</span> Map
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-lg">
          
          {/* Top Recommended Box */}
          <div className="bg-[#F4F8FA] rounded-3xl p-lg border border-[#E1EEF4]">
            <h3 className="text-[18px] font-bold text-on-surface mb-md flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500" style={{fontVariationSettings: "'FILL' 1"}}>campaign</span>
              Top Recommended Today
            </h3>
            
            <div className="flex flex-col gap-md">
              {/* Review 1 */}
              <div className="bg-white rounded-2xl p-md shadow-sm border border-outline-variant/30 relative">
                <div className="absolute top-2 right-2 text-blue-100 opacity-50">
                  <span className="material-symbols-outlined text-[48px]" style={{fontVariationSettings: "'FILL' 1"}}>format_quote</span>
                </div>
                <div className="flex items-center gap-xs mb-sm relative z-10">
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                    <img src="https://picsum.photos/seed/sarah/100" alt="Sarah Jenkins" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[13px] font-bold text-on-surface flex items-center gap-1">
                    Sarah Jenkins <span className="material-symbols-outlined text-[12px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                  </span>
                </div>
                <p className="text-[13px] text-on-surface-variant italic leading-relaxed relative z-10">
                  "Elite Plumbing saved us this morning! Arrived in 20 mins and fixed the burst pipe quickly. Highly recommend."
                </p>
                <div className="mt-sm pt-sm border-t border-outline-variant/50 text-[11px] font-bold text-blue-700">
                  Recommending: Elite Plumbing
                </div>
              </div>

              {/* Review 2 */}
              <div className="bg-white rounded-2xl p-md shadow-sm border border-outline-variant/30 relative">
                <div className="absolute top-2 right-2 text-blue-100 opacity-50">
                  <span className="material-symbols-outlined text-[48px]" style={{fontVariationSettings: "'FILL' 1"}}>format_quote</span>
                </div>
                <div className="flex items-center gap-xs mb-sm relative z-10">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-black shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                    M
                  </div>
                  <span className="text-[13px] font-bold text-on-surface flex items-center gap-1">
                    Mike T. <span className="material-symbols-outlined text-[12px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                  </span>
                </div>
                <p className="text-[13px] text-on-surface-variant italic leading-relaxed relative z-10">
                  "Bright Minds got my son's algebra grade up from a C to an A- in just one semester. Fantastic tutors."
                </p>
                <div className="mt-sm pt-sm border-t border-outline-variant/50 text-[11px] font-bold text-blue-700">
                  Recommending: Bright Minds Tutoring
                </div>
              </div>
            </div>
            
            <button className="w-full mt-md bg-white text-on-surface border border-outline-variant py-2.5 rounded-xl text-[13px] font-bold hover:bg-surface-container transition-colors shadow-sm">
              Read More Reviews
            </button>
          </div>

          {/* Map View Box */}
          <div className="bg-surface-container rounded-3xl overflow-hidden relative shadow-sm border border-outline-variant/50 h-[240px] group cursor-pointer">
            <img src="https://picsum.photos/seed/mapview/600/400" alt="Map View" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-lg w-full">
              <h3 className="text-white text-[20px] font-bold flex items-center gap-xs mb-1">
                <span className="material-symbols-outlined text-[24px]">map</span> Map View
              </h3>
              <p className="text-white/80 text-[13px] font-medium">Explore businesses near you</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
