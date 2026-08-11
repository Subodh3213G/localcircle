import { getMarketplaceItems } from '@/app/actions/marketplace'
import MarketplaceClient from '@/components/marketplace-client'

export default async function MarketplacePage() {
  const items = await getMarketplaceItems()

  return (
    <div className="flex flex-col gap-lg w-full max-w-6xl mx-auto pb-xl">
      {/* Hero Banner */}
      <div className="relative w-full rounded-[24px] overflow-hidden bg-surface-container shadow-sm min-h-[320px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img src="https://picsum.photos/seed/market123/1200/400" alt="Neighborhood Market" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 w-full p-xl md:px-12 flex flex-col md:flex-row items-center justify-between gap-xl">
          <div className="flex flex-col max-w-lg">
            <div className="flex self-start items-center gap-xs bg-[#D1F4E0] text-[#0A5C36] px-sm py-[4px] rounded-md text-[12px] font-bold mb-md uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>verified_user</span>
              100% Verified Neighborhood Trade
            </div>
            <h1 className="text-display font-display text-on-surface mb-sm">Marketplace</h1>
            <p className="text-body-lg text-on-surface/80 leading-relaxed">
              Buy, sell, and give away items locally. Every transaction is with a verified resident, ensuring a safe and trusted community exchange.
            </p>
          </div>
          
          {/* Safety First Box */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-lg shadow-md border border-outline-variant/30 min-w-[280px]">
            <div className="flex items-center justify-between mb-sm">
              <h3 className="font-headline-md text-[18px] text-on-surface">Safety First</h3>
              <span className="material-symbols-outlined text-primary">gpp_maybe</span>
            </div>
            <ul className="flex flex-col gap-sm">
              <li className="flex items-center gap-xs text-body-md text-on-surface/80">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span> Verified Identities
              </li>
              <li className="flex items-center gap-xs text-body-md text-on-surface/80">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span> Local Exchanges Only
              </li>
              <li className="flex items-center gap-xs text-body-md text-on-surface/80">
                <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span> Secure Messaging
              </li>
            </ul>
          </div>
        </div>
      </div>

      <MarketplaceClient initialItems={items} />
    </div>
  )
}
