'use server'

export async function fetchLocalNews(query: string) {
  try {
    const encodedQuery = encodeURIComponent(query + ' when:7d')
    const url = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-IN&gl=IN&ceid=IN:en`
    
    // Disable caching completely to ensure live local updates
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch news')
    
    const xml = await res.text()
    
    // Manual XML parsing for RSS items
    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1]
      
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/)
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/)
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/)
      
      if (titleMatch && linkMatch) {
        let title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim()
        
        // Google News often appends " - Source Name" to the title, remove it
        const sourceName = sourceMatch ? sourceMatch[1] : 'Local News'
        if (title.endsWith(` - ${sourceName}`)) {
          title = title.substring(0, title.length - sourceName.length - 3)
        }
        
        items.push({
          title,
          url: linkMatch[1],
          publishedAt: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
          source: { name: sourceName },
          description: '', // Google News description is usually just a link to the article, we'll leave it blank or use title
          // Assign a random deterministic image based on title length or source name to make it look good
          urlToImage: `https://picsum.photos/seed/${encodeURIComponent(title.substring(0, 10))}/600/400`
        })
      }
    }
    
    return items.slice(0, 15)
  } catch (error) {
    console.error('Error fetching local news:', error)
    return []
  }
}
