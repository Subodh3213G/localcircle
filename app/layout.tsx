import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NavigationSidebar from '@/components/ui/navigation-sidebar'
import Header from '@/components/ui/header'
import RealtimeAlerts from '@/components/alerts/realtime-alerts'
import AuthProvider from '@/components/auth-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'LocalCircle: Hyper-Local Community Hub',
  description: 'Connect with verified neighbors, discover local events, and stay safe.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} bg-background font-body-md text-on-surface`}>
        <AuthProvider>
          <Header />
          <NavigationSidebar />
          <div className="pl-64 pt-16">
            <main className="max-w-max-width mx-auto p-margin-desktop">
              {children}
            </main>
          </div>
          
          {/* Global Floating Overlays */}
          <RealtimeAlerts />
        </AuthProvider>
      </body>
    </html>
  )
}
