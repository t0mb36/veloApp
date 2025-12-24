'use client'

import { Sidebar } from './sidebar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6">{children}</div>
      </main>
    </div>
  )
}
