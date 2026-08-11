'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavigationSidebar() {
  const pathname = usePathname()

  const getLinkClass = (path: string) => {
    const isActive = pathname === path
    const baseClass = "flex items-center gap-md px-md py-sm rounded-lg transition-all"
    if (isActive) {
      return `${baseClass} bg-secondary-container text-on-secondary-container font-semibold`
    }
    return `${baseClass} text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface font-body-md`
  }

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-on-secondary border-r border-outline-variant z-40 flex flex-col p-md">
      <nav className="flex-1 flex flex-col gap-xs">
        <Link href="/" className={getLinkClass('/')}>
          <span className="material-symbols-outlined">home</span>Home / Feed
        </Link>
        <Link href="/alerts" className={`justify-between ${getLinkClass('/alerts')}`}>
          <div className="flex items-center gap-md">
            <span className="material-symbols-outlined text-error">notification_important</span>Urgent Alerts
          </div>
          <span className="w-2 h-2 bg-error rounded-full"></span>
        </Link>
        <Link href="/marketplace" className={getLinkClass('/marketplace')}>
          <span className="material-symbols-outlined">storefront</span>Marketplace
        </Link>
        <Link href="/directory" className={getLinkClass('/directory')}>
          <span className="material-symbols-outlined">business_center</span>Business Directory
        </Link>
        <Link href="/groups" className={getLinkClass('/groups')}>
          <span className="material-symbols-outlined">groups</span>Private Groups
        </Link>
        <Link href="/news" className={getLinkClass('/news')}>
          <span className="material-symbols-outlined">newspaper</span>Local News
        </Link>
      </nav>
      <div className="pt-md mt-md border-t border-outline-variant">
        <Link href="/settings" className={getLinkClass('/settings')}>
          <span className="material-symbols-outlined">settings</span>Settings
        </Link>
      </div>
    </aside>
  )
}
