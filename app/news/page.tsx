'use client'

import { useEffect, useState } from 'react'

import { useAppStore } from '@/store/useAppStore'
import { fetchLocalNews } from '@/app/actions/news'

type Article = {
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: { name: string }
}

export default function LocalNewsPage() {
  const { currentNeighborhood } = useAppStore()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getNews() {
      if (!currentNeighborhood) return
      
      try {
        setLoading(true)
        const query = `${currentNeighborhood.city} ${currentNeighborhood.state} News`
        const fetchedArticles = await fetchLocalNews(query)
        setArticles(fetchedArticles.slice(0, 10))
      } catch (err) {
        console.error('Failed to fetch news:', err)
      } finally {
        setLoading(false)
      }
    }
    
    getNews()
  }, [currentNeighborhood])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-md">
        <span className="material-symbols-outlined animate-spin text-[40px] text-secondary">refresh</span>
        <p className="text-label-md font-label-md text-on-surface-variant">Loading local news...</p>
      </div>
    )
  }

  if (articles.length === 0) return null

  const topStory = articles[0]
  const verticalNews = articles.slice(1, 3)
  const horizontalNews = articles[3]
  const communityHighlights = articles.slice(4, 6)

  const bulletinNotices = [
    {
      title: "Holiday Trash Collection Schedule",
      desc: "Due to Memorial Day, all trash collections will be delayed by one day this week.",
      icon: "delete",
      colorClass: "text-error"
    },
    {
      title: "Public Hearing: Downtown Zoning",
      desc: "Join us Tuesday at 7 PM at City Hall to discuss proposed changes to the zoning map.",
      icon: "gavel",
      colorClass: "text-secondary"
    },
    {
      title: "Water Main Maintenance",
      desc: "Residents on Elm St may experience low water pressure between 9 AM and 2 PM.",
      icon: "water_drop",
      colorClass: "text-primary-fixed-dim"
    }
  ]

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto pb-xl">
      {/* Top Story Header */}
      <h1 className="text-headline-lg font-headline-lg text-on-surface mb-md">Top Story</h1>
      
      {/* Hero / Top Story */}
      {topStory && (
        <a href={topStory.url} target="_blank" rel="noreferrer" className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-sm group block">
          <img src={topStory.urlToImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Top Story" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-lg md:p-xl flex flex-col gap-sm w-full md:w-3/4">
            <span className="bg-secondary text-on-secondary px-sm py-[2px] rounded text-caption font-label-md uppercase w-max tracking-wider">
              {topStory.source.name.substring(0, 15)}
            </span>
            <h2 className="text-[28px] md:text-headline-lg font-headline-lg text-white leading-tight line-clamp-2 md:line-clamp-3">
              {topStory.title}
            </h2>
            <p className="text-body-md text-white/90 line-clamp-2 mt-xs">
              {topStory.description}
            </p>
            <div className="flex items-center gap-sm text-white/80 text-caption font-label-md mt-sm">
              <span>By NewsAPI</span>
              <span>•</span>
              <span>{new Date(topStory.publishedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
            </div>
          </div>
        </a>
      )}

      <div className="flex flex-col lg:flex-row gap-xl mt-xl">
        {/* Left Column: Latest News & Highlights */}
        <div className="flex-1 flex flex-col">
          
          {/* Latest News Header */}
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-[20px] font-headline-md text-on-surface">Latest News</h2>
            <a href="#" className="text-secondary font-label-md hover:underline flex items-center gap-xs text-label-md">
              View All <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
          
          {/* Latest News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
            {/* Vertical Cards */}
            {verticalNews.map((article, i) => (
              <a key={i} href={article.url} target="_blank" rel="noreferrer" className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant hover:shadow-md transition-all group flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img src={article.urlToImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="News" />
                </div>
                <div className="p-md flex flex-col flex-1 gap-xs justify-between">
                  <div>
                    <div className="flex items-center gap-sm mb-sm">
                      <span className={`${i % 2 === 0 ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container'} px-xs py-[2px] rounded text-[10px] font-label-md uppercase tracking-wider`}>
                        {article.source.name.substring(0, 10)}
                      </span>
                      <span className="text-caption text-on-surface-variant">
                        {new Date(article.publishedAt).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <h3 className="text-label-md font-headline-md text-on-surface line-clamp-2 group-hover:text-secondary transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-caption font-body-md text-on-surface-variant line-clamp-3 mt-xs">
                      {article.description}
                    </p>
                  </div>
                  <div className="mt-sm">
                    <span className="text-secondary text-caption font-label-md group-hover:underline flex items-center gap-xs">
                      Read More <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          {/* Horizontal Card */}
          {horizontalNews && (
            <a href={horizontalNews.url} target="_blank" rel="noreferrer" className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant hover:shadow-md transition-all group flex flex-col sm:flex-row overflow-hidden h-auto sm:h-48">
              <div className="sm:w-2/5 h-48 sm:h-full overflow-hidden shrink-0">
                <img src={horizontalNews.urlToImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="News" />
              </div>
              <div className="p-md flex-1 flex flex-col justify-center gap-xs">
                 <div className="flex items-center gap-sm mb-xs">
                    <span className="bg-secondary-container text-on-secondary-container px-xs py-[2px] rounded text-[10px] font-label-md uppercase tracking-wider">
                      EVENTS
                    </span>
                    <span className="text-caption text-on-surface-variant">
                      {new Date(horizontalNews.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-label-md font-headline-md text-on-surface line-clamp-2 group-hover:text-secondary transition-colors leading-snug">
                    {horizontalNews.title}
                  </h3>
                  <p className="text-caption font-body-md text-on-surface-variant line-clamp-2 mt-xs">
                    {horizontalNews.description}
                  </p>
                  <div className="mt-sm">
                    <span className="text-secondary text-caption font-label-md group-hover:underline flex items-center gap-xs">
                      Read More <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    </span>
                  </div>
              </div>
            </a>
          )}

          {/* Community Highlights */}
          <div className="mt-xl">
            <div className="flex items-center gap-sm mb-md text-on-surface">
              <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
              <h2 className="text-[18px] font-headline-md">Community Highlights</h2>
            </div>
            <div className="flex flex-col gap-sm">
              {communityHighlights.map((article, i) => (
                <a key={i} href={article.url} target="_blank" rel="noreferrer" className="bg-surface-container-low rounded-xl p-md flex items-start gap-md hover:bg-surface-container transition-colors border border-transparent hover:border-outline-variant/50">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 overflow-hidden text-on-primary-container font-headline-md shadow-sm">
                     {article.urlToImage ? <img src={article.urlToImage} className="w-full h-full object-cover" /> : article.source.name.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-xs pt-1">
                    <h4 className="text-label-md font-label-md text-on-surface leading-tight line-clamp-1">{article.title}</h4>
                    <p className="text-caption font-body-md text-on-surface-variant line-clamp-2">{article.description}</p>
                    <span className="text-[11px] font-caption text-on-surface-variant/70 mt-1">— Posted by {article.source.name}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Municipal Bulletin & Newsletter */}
        <div className="w-full lg:w-[320px] flex flex-col gap-lg shrink-0">
          
          {/* Municipal Bulletin */}
          <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-md shadow-md border border-outline-variant/10">
            <div className="flex items-center gap-sm mb-sm text-white">
              <span className="material-symbols-outlined text-[22px]">account_balance</span>
              <h2 className="text-[18px] font-headline-md text-white">Municipal Bulletin</h2>
            </div>
            <p className="text-[12px] font-body-md text-inverse-on-surface/80 mb-md border-b border-white/10 pb-md">
              Official notices and civic updates.
            </p>
            
            <div className="flex flex-col gap-md mb-lg">
              {bulletinNotices.map((notice, idx) => (
                <div key={idx} className="flex gap-sm items-start group cursor-pointer">
                  <span className={`material-symbols-outlined text-[18px] mt-0.5 ${notice.colorClass}`}>{notice.icon}</span>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[13px] font-label-md text-white group-hover:text-primary-fixed-dim transition-colors leading-tight">{notice.title}</h4>
                    <p className="text-[11px] font-body-md leading-tight text-inverse-on-surface/70 line-clamp-3">{notice.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-[13px] font-label-md text-white border border-white/10">
              View All Notices
            </button>
          </div>

          {/* Newsletter */}
          <div className="bg-surface-container-low rounded-xl p-md shadow-sm border border-outline-variant">
            <h2 className="text-[16px] font-headline-md text-on-surface mb-xs">Newsletter</h2>
            <p className="text-[12px] font-body-md text-on-surface-variant mb-md">
              Get the most important local updates delivered straight to your inbox every Friday.
            </p>
            
            <div className="flex flex-col gap-sm">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">mail</span>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-md py-2 text-[13px] font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" 
                />
              </div>
              <button className="w-full py-2 bg-secondary hover:bg-secondary/90 transition-colors rounded-lg text-[13px] font-label-md text-on-secondary shadow-sm">
                Subscribe
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
