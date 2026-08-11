'use client'

import { useAppStore } from '@/store/useAppStore'
import LocationPrompt from '@/components/onboarding/location-prompt'
import NeighborhoodTrust from '@/components/dashboard/neighborhood-trust'
import CreatePost from '@/components/feed/create-post'
import FeedList from '@/components/feed/feed-list'

export default function HomePage() {
  const { currentNeighborhood } = useAppStore()

  // The AuthProvider already guarantees currentNeighborhood exists at this point.
  if (!currentNeighborhood) return null

  // Once boundary is verified, show the Boundary-scoped timeline (FR-2)
  return (
    <div className="flex flex-col w-full gap-xl lg:flex-row">
      <div className="flex-1 flex flex-col gap-lg">
        {/* Post Creation (FR-2) */}
        <CreatePost />

        {/* Boundary-scoped timeline (FR-2) */}
        <div className="flex flex-col gap-lg">
          <FeedList />
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-lg">
        {/* Verification Status */}
        {/* Verification Status */}
        <NeighborhoodTrust />
        
        {/* Local Events */}
        <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <h3 className="text-label-md font-label-md text-on-surface">Local Events</h3>
            <button className="text-caption font-label-md text-secondary hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-sm">
            <div className="flex gap-md items-start p-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-caption font-label-md text-error">APR</span>
                <span className="text-headline-md font-headline-md text-on-surface">12</span>
              </div>
              <div>
                <h4 className="text-label-md font-label-md text-on-surface">City Council Meeting</h4>
                <span className="text-caption font-caption text-on-surface-variant">Town Hall • 6:00 PM</span>
              </div>
            </div>
            <div className="flex gap-md items-start p-sm rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-caption font-label-md text-secondary">APR</span>
                <span className="text-headline-md font-headline-md text-on-surface">15</span>
              </div>
              <div>
                <h4 className="text-label-md font-label-md text-on-surface">Spring Block Party</h4>
                <span className="text-caption font-caption text-on-surface-variant">Oak St • 12:00 PM</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trending */}
        <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm flex flex-col gap-md">
          <h3 className="text-label-md font-label-md text-on-surface">Trending in {currentNeighborhood.name}</h3>
          <div className="flex flex-col gap-sm">
            <div className="flex items-center gap-sm">
              <span className="text-body-md font-label-md text-on-surface-variant opacity-50">1</span>
              <div className="flex-1">
                <h4 className="text-label-md font-label-md text-on-surface cursor-pointer hover:text-secondary">#CentennialPark</h4>
                <p className="text-caption font-caption text-on-surface-variant">42 posts today</p>
              </div>
            </div>
            <div className="flex items-center gap-sm">
              <span className="text-body-md font-label-md text-on-surface-variant opacity-50">2</span>
              <div className="flex-1">
                <h4 className="text-label-md font-label-md text-on-surface cursor-pointer hover:text-secondary">#LostDog</h4>
                <p className="text-caption font-caption text-on-surface-variant">18 posts today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
